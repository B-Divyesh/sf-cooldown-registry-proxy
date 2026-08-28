import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const repositoryRoot = new URL('../../', import.meta.url).pathname

function runDemo(check) {
  const output = execFileSync('cargo', ['run', '--quiet', '--', '--json', 'demo'], { encoding: 'utf8' })
  const result = JSON.parse(output)
  try { check(result) } finally { rmSync(result.workspace, { recursive: true, force: true }) }
}

function decision(result, ecosystem) {
  return result.report.decisions.find((item) => item.ecosystem === ecosystem)
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

function compileIoGuard(root) {
  const library = join(root, 'io-guard.so')
  execFileSync('gcc', [
    '-shared', '-fPIC', '-O2', '-Wall', '-Wextra',
    '-o', library, join(repositoryRoot, 'site/fixtures/io-guard.c'), '-ldl'
  ], { stdio: 'pipe' })
  return library
}

function tracedEnvironment(library, trace, extra = {}) {
  return {
    ...process.env,
    LD_PRELOAD: library,
    CRP_IO_TRACE: trace,
    CRP_LOOPBACK_ONLY: '1',
    ...extra
  }
}

async function unusedPort() {
  const server = createServer()
  const port = await listen(server)
  await new Promise((resolve) => server.close(resolve))
  return port
}

function createRegistry(requests) {
  return createServer((request, response) => {
    requests.push(request.url)
    const base = `http://${request.headers.host}`
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString()
    const fresh = new Date(Date.now() - 60 * 60_000).toISOString()
    if (request.url === '/advisories') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ blocked: [
        { ecosystem: 'npm', package: 'claim-npm', version: '3.0.0', id: 'CLAIM-NPM-1', reason: 'Claim fixture' },
        { ecosystem: 'pypi', package: 'claim-pypi', version: '3.0.0', id: 'CLAIM-PYPI-1', reason: 'Claim fixture' },
        { ecosystem: 'cargo', package: 'claim-cargo', version: '3.0.0', id: 'CLAIM-CARGO-1', reason: 'Claim fixture' }
      ] }))
      return
    }
    if (request.url === '/claim-npm') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({
        name: 'claim-npm',
        'dist-tags': { latest: '3.0.0' },
        time: { '1.0.0': old, '2.0.0': fresh, '3.0.0': old },
        versions: {
          '1.0.0': { dist: { tarball: `${base}/claim-npm-1.0.0.tgz` } },
          '2.0.0': { dist: { tarball: `${base}/claim-npm-2.0.0.tgz` } },
          '3.0.0': { dist: { tarball: `${base}/claim-npm-3.0.0.tgz` } }
        }
      }))
      return
    }
    if (request.url === '/claim-npm-1.0.0.tgz') {
      response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
      response.end('allowed-package-bytes')
      return
    }
    if (request.url === '/pypi/claim-pypi/json') {
      const release = (version, uploaded) => [{
        filename: `claim_pypi-${version}-py3-none-any.whl`,
        upload_time_iso_8601: uploaded,
        url: `${base}/claim_pypi-${version}-py3-none-any.whl`,
        digests: { sha256: `claim-${version}` },
        yanked: false
      }]
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({
        info: { name: 'claim-pypi' },
        releases: { '1.0.0': release('1.0.0', old), '2.0.0': release('2.0.0', fresh), '3.0.0': release('3.0.0', old) }
      }))
      return
    }
    if (request.url === '/cl/ai/claim-cargo') {
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end(['1.0.0', '2.0.0', '3.0.0'].map((version) => JSON.stringify({
        name: 'claim-cargo', vers: version, cksum: `claim-${version}`, deps: [], features: {}
      })).join('\n'))
      return
    }
    if (request.url === '/api/v1/crates/claim-cargo') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ versions: [
        { num: '1.0.0', created_at: old },
        { num: '2.0.0', created_at: fresh },
        { num: '3.0.0', created_at: old }
      ] }))
      return
    }
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end('{"error":"fixture_not_found"}')
  })
}

async function waitForReady(url, child) {
  let lastError
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`proxy exited before ready with ${child.exitCode}`)
    try {
      const response = await fetch(`${url}/healthz`)
      if (response.ok) return
    } catch (error) {
      lastError = error
    }
    await delay(50)
  }
  throw new Error(`proxy did not become ready: ${lastError}`)
}

async function withProductionServe(check) {
  execFileSync('cargo', ['build', '--quiet'])
  const root = mkdtempSync(join(tmpdir(), 'cooldown-production-claim-'))
  const runtimeCwd = join(root, 'runtime-cwd')
  const cacheDir = join(root, 'configured-cache')
  const auditLog = join(root, 'configured-logs', 'refusals.jsonl')
  mkdirSync(runtimeCwd)
  const upstreamRequests = []
  const upstream = createRegistry(upstreamRequests)
  const upstreamPort = await listen(upstream)
  const upstreamUrl = `http://127.0.0.1:${upstreamPort}`
  const proxyPort = await unusedPort()
  const proxyUrl = `http://127.0.0.1:${proxyPort}`
  const binary = join(repositoryRoot, 'target/debug/cooldown-registry-proxy')
  const ioTrace = join(root, 'serve-io.tsv')
  const ioGuard = compileIoGuard(root)
  const child = spawn(binary, [
    'serve', '--listen', `127.0.0.1:${proxyPort}`, '--public-url', proxyUrl,
    '--cooldown', '7d', '--cache-ttl', '1s', '--cache-dir', cacheDir,
    '--audit-log', auditLog, '--advisory-url', `${upstreamUrl}/advisories`,
    '--npm-upstream', upstreamUrl, '--pypi-upstream', upstreamUrl,
    '--cargo-index-upstream', upstreamUrl, '--crates-api-upstream', upstreamUrl
  ], {
    cwd: runtimeCwd,
    env: tracedEnvironment(ioGuard, ioTrace, { CRP_FORBIDDEN_PREFIX: runtimeCwd, CRP_DENY_RELATIVE: '1' }),
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let diagnostics = ''
  child.stdout.on('data', (chunk) => { diagnostics += chunk })
  child.stderr.on('data', (chunk) => { diagnostics += chunk })
  try {
    await waitForReady(proxyUrl, child)
    await check({ root, runtimeCwd, cacheDir, auditLog, proxyUrl, ioTrace, upstreamRequests, upstreamUrl })
  } catch (error) {
    error.message = `${error.message}\nproxy output:\n${diagnostics}`
    throw error
  } finally {
    child.kill('SIGTERM')
    await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(2_000)])
    await new Promise((resolve) => {
      upstream.close(resolve)
      upstream.closeAllConnections?.()
    })
    rmSync(root, { recursive: true, force: true })
  }
}

async function proxyRequest(proxyUrl, path) {
  const response = await fetch(`${proxyUrl}${path}`)
  return {
    status: response.status,
    body: await response.text(),
    requestId: response.headers.get('x-request-id')
  }
}

test('@claim:cooldown-block fresh npm metadata and its direct file are blocked', () => {
  runDemo((result) => {
    assert.equal(decision(result, 'npm').outcome, 'blocked_by_cooldown')
    assert.equal(decision(result, 'npm').metadata_visible, false)
    assert.equal(decision(result, 'npm').direct_status, 404)
  })
})

test('@claim:registry-paths one demo proxy checks npm, PyPI, and Cargo paths', () => {
  runDemo((result) => assert.deepEqual(
    result.report.decisions.map((item) => item.ecosystem),
    ['npm', 'pypi', 'cargo']
  ))
})

test('@claim:metadata-filter blocked versions are absent from registry responses', () => {
  runDemo((result) => {
    assert.equal(decision(result, 'npm').metadata_visible, false)
    assert.equal(decision(result, 'pypi').metadata_visible, true)
    assert.equal(decision(result, 'cargo').metadata_visible, false)
  })
})

test('@claim:direct-downloads every sample direct download receives its policy status', () => {
  runDemo((result) => assert.deepEqual(
    result.report.decisions.map((item) => item.direct_status),
    [404, 200, 451]
  ))
})

test('@claim:advisory-block advisory wins over the matching active exclusion', () => {
  runDemo((result) => {
    assert.equal(result.policy.exclusions, 1)
    assert.equal(result.policy.blocked, 1)
    assert.equal(decision(result, 'cargo').outcome, 'blocked_by_advisory')
    assert.equal(decision(result, 'cargo').direct_status, 451)
  })
})

test('@claim:sample-decisions bundled sample returns one allow and two different blocks', () => {
  runDemo((result) => assert.deepEqual(
    result.report.decisions.map((item) => item.outcome),
    ['blocked_by_cooldown', 'allowed', 'blocked_by_advisory']
  ))
})

test('@claim:refusal-jsonl every supported production refusal path writes one JSONL record per blocked version', async () => {
  await withProductionServe(async ({ auditLog, proxyUrl }) => {
    const metadata = [
      { ecosystem: 'npm', package: 'claim-npm', path: '/npm/claim-npm', parse: (body) => Object.keys(JSON.parse(body).versions) },
      { ecosystem: 'pypi', package: 'claim-pypi', path: '/pypi/simple/claim-pypi/', parse: (body) => [...new Set([...body.matchAll(/claim_pypi-([0-9.]+)-/g)].map((match) => match[1]))] },
      { ecosystem: 'cargo', package: 'claim-cargo', path: '/cargo/cl/ai/claim-cargo', parse: (body) => body.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line).vers) }
    ]
    const metadataResponses = []
    for (const item of metadata) {
      const response = await proxyRequest(proxyUrl, item.path)
      assert.equal(response.status, 200)
      assert.match(response.requestId, /^crp-[0-9a-f]{16}$/)
      assert.deepEqual(item.parse(response.body), ['1.0.0'])
      metadataResponses.push({ ...item, ...response })
    }

    const direct = []
    for (const item of [
      { ecosystem: 'npm', package: 'claim-npm', version: '2.0.0', action: 'cooldown_block', status: 404, path: '/npm-tarball/claim-npm/2.0.0/claim-npm-2.0.0.tgz' },
      { ecosystem: 'npm', package: 'claim-npm', version: '3.0.0', action: 'advisory_block', status: 451, path: '/npm-tarball/claim-npm/3.0.0/claim-npm-3.0.0.tgz' },
      { ecosystem: 'pypi', package: 'claim-pypi', version: '2.0.0', action: 'cooldown_block', status: 404, path: '/pypi-files/claim-pypi/claim_pypi-2.0.0-py3-none-any.whl' },
      { ecosystem: 'pypi', package: 'claim-pypi', version: '3.0.0', action: 'advisory_block', status: 451, path: '/pypi-files/claim-pypi/claim_pypi-3.0.0-py3-none-any.whl' },
      { ecosystem: 'cargo', package: 'claim-cargo', version: '2.0.0', action: 'cooldown_block', status: 404, path: '/cargo-crates/claim-cargo/2.0.0/download' },
      { ecosystem: 'cargo', package: 'claim-cargo', version: '3.0.0', action: 'advisory_block', status: 451, path: '/cargo-crates/claim-cargo/3.0.0/download' }
    ]) {
      const response = await proxyRequest(proxyUrl, item.path)
      assert.equal(response.status, item.status)
      assert.match(response.requestId, /^crp-[0-9a-f]{16}$/)
      assert.equal(JSON.parse(response.body).request_id, response.requestId)
      direct.push({ ...item, ...response })
    }

    const rows = readFileSync(auditLog, 'utf8').trim().split('\n').map(JSON.parse)
    assert.equal(rows.length, 12)
    for (const response of metadataResponses) {
      const matching = rows.filter((row) => row.request_id === response.requestId)
      assert.equal(matching.length, 2)
      assert.deepEqual(new Set(matching.map((row) => row.action)), new Set(['cooldown_block', 'advisory_block']))
      assert.equal(matching.every((row) => row.ecosystem === response.ecosystem && row.package === response.package), true)
    }
    for (const response of direct) {
      const matching = rows.filter((row) => row.request_id === response.requestId)
      assert.equal(matching.length, 1)
      assert.deepEqual(
        { ecosystem: matching[0].ecosystem, package: matching[0].package, version: matching[0].version, action: matching[0].action },
        { ecosystem: response.ecosystem, package: response.package, version: response.version, action: response.action }
      )
    }
    for (const row of rows) assert.match(row.request_id, /^crp-[0-9a-f]{16}$/)
  })
})

test('@claim:cli-demo-workspace CLI demo runs proxy checks in a new temporary workspace', () => {
  runDemo((result) => {
    assert.equal(result.ok, true)
    assert.equal(existsSync(`${result.workspace}/policy/exclusions.json`), true)
    assert.equal(existsSync(`${result.workspace}/policy/advisories.json`), true)
    assert.equal(existsSync(`${result.workspace}/report.json`), true)
    assert.equal(result.report.decisions.length, 3)
  })
})

test('@claim:cli-demo-isolation file and socket guards prove the demo ignores existing data and uses only loopback', () => {
  execFileSync('cargo', ['build', '--quiet'])
  const cwd = mkdtempSync(join(tmpdir(), 'cooldown-existing-data-'))
  const existing = join(cwd, 'data')
  const sentinel = join(existing, 'refusals.jsonl')
  const config = join(cwd, 'cooldown.toml')
  const cached = join(existing, 'cache', 'real-package.metadata')
  mkdirSync(join(existing, 'cache'), { recursive: true })
  writeFileSync(sentinel, 'real settings stay untouched')
  writeFileSync(config, 'real configuration stays private')
  writeFileSync(cached, 'real cache stays private')
  const binary = new URL('../../target/debug/cooldown-registry-proxy', import.meta.url).pathname
  const ioGuard = compileIoGuard(cwd)
  const ioTrace = join(tmpdir(), `cooldown-demo-io-${process.pid}-${Date.now()}.tsv`)
  const output = execFileSync(binary, ['--json', 'demo'], {
    cwd,
    encoding: 'utf8',
    env: tracedEnvironment(ioGuard, ioTrace, { CRP_FORBIDDEN_PREFIX: cwd, CRP_DENY_RELATIVE: '1' })
  })
  const result = JSON.parse(output)
  try {
    assert.equal(readFileSync(sentinel, 'utf8'), 'real settings stay untouched')
    assert.equal(readFileSync(config, 'utf8'), 'real configuration stays private')
    assert.equal(readFileSync(cached, 'utf8'), 'real cache stays private')
    assert.equal(relative(cwd, result.workspace).startsWith('..'), true)
    const trace = readFileSync(ioTrace, 'utf8').trim().split('\n')
    assert.equal(trace.some((line) => line.includes(result.workspace)), true)
    assert.equal(trace.some((line) => line.includes(cwd)), false)
    const connections = trace.filter((line) => line.startsWith('CONNECT\t'))
    assert.ok(connections.length > 0)
    assert.equal(connections.every((line) => /^CONNECT\t(?:127\.0\.0\.1|\[::1\]):/.test(line)), true)
  } finally {
    rmSync(result.workspace, { recursive: true, force: true })
    rmSync(cwd, { recursive: true, force: true })
    rmSync(ioTrace, { force: true })
  }
})

test('@claim:local-demo-output CLI demo keeps cache, policy, report, and log in its workspace', () => {
  runDemo((result) => {
    for (const path of [result.cache_dir, result.audit_log, `${result.workspace}/policy`, `${result.workspace}/report.json`]) {
      assert.equal(relative(result.workspace, path).startsWith('..'), false)
    }
    assert.equal(result.report.cached_files, 5)
  })
})

test('@claim:configured-outbound process guard denies unconfigured traffic and records every configured registry and advisory request', async () => {
  await withProductionServe(async ({ ioTrace, proxyUrl, upstreamRequests, upstreamUrl }) => {
    await proxyRequest(proxyUrl, '/npm/claim-npm')
    await proxyRequest(proxyUrl, '/pypi/simple/claim-pypi/')
    await proxyRequest(proxyUrl, '/cargo/cl/ai/claim-cargo')
    assert.deepEqual(new Set(upstreamRequests), new Set([
      '/advisories', '/claim-npm', '/pypi/claim-pypi/json', '/cl/ai/claim-cargo', '/api/v1/crates/claim-cargo'
    ]))
    const trace = readFileSync(ioTrace, 'utf8').trim().split('\n')
    const connections = trace.filter((line) => line.startsWith('CONNECT\t'))
    assert.ok(connections.length >= 1)
    const configuredEndpoint = new URL(upstreamUrl).host
    assert.equal(connections.every((line) => line === `CONNECT\t${configuredEndpoint}`), true)
    assert.equal(trace.filter((line) => line.startsWith('DNS\t')).every((line) => /\t(?:127\.0\.0\.1|localhost|::1)$/.test(line)), true)
  })
})

test('@claim:terminal-recording terminal artwork matches a fresh CLI demo report', () => {
  runDemo((result) => {
    const recording = readFileSync(new URL('../public/demo-terminal.svg', import.meta.url), 'utf8')
    for (const item of result.report.decisions) {
      assert.match(recording, new RegExp(`${item.ecosystem} ${item.package}@${item.version}: ${item.outcome.replaceAll('_', ' ')} · HTTP ${item.direct_status}`))
    }
    assert.match(recording, new RegExp(`evidence: ${result.report.audit_records} refusal records, ${result.report.cached_files} cached files`))
    assert.match(recording, /path: \/tmp\/cooldown-registry-proxy-demo-/)
  })
})

test('@claim:local-output-sensitive-data refusal records contain package names', () => {
  runDemo((result) => {
    const rows = readFileSync(result.audit_log, 'utf8').trim().split('\n').map(JSON.parse)
    assert.equal(rows.some((row) => row.package === 'signal-router'), true)
    assert.equal(rows.some((row) => row.package === 'vault-door'), true)
  })
})

test('@claim:policy-files exclusions require fields and advisories override them', () => {
  const valid = JSON.parse(execFileSync('cargo', [
    'run', '--quiet', '--', 'validate',
    '--exclusions', 'examples/demo/exclusions.json',
    '--advisories', 'examples/demo/advisories.json', '--json'
  ], { encoding: 'utf8' }))
  assert.deepEqual(valid, { valid: true, exclusions: 1, blocked: 1 })
  const dir = mkdtempSync(join(tmpdir(), 'cooldown-invalid-policy-'))
  const invalid = join(dir, 'exclusions.json')
  writeFileSync(invalid, '{"exclusions":[{"ecosystem":"npm","package":"x","version":"1","expires":"2099-01-01T00:00:00Z","reason":""}]}')
  const rejected = spawnSync('cargo', ['run', '--quiet', '--', '--json', 'validate', '--exclusions', invalid], { encoding: 'utf8' })
  rmSync(dir, { recursive: true, force: true })
  assert.notEqual(rejected.status, 0)
  assert.match(rejected.stderr, /reason cannot be empty/)
  runDemo((result) => assert.equal(decision(result, 'cargo').outcome, 'blocked_by_advisory'))
})

test('@claim:unsupported-scope CLI exposes no hosting, authentication, or scanning feature', () => {
  const help = execFileSync('cargo', ['run', '--quiet', '--', '--help'], { encoding: 'utf8' })
  assert.match(help, /serve/)
  assert.match(help, /validate/)
  assert.match(help, /demo/)
  assert.doesNotMatch(help, /private package|authentication|code scan/i)
})

test('@claim:binary-build release build produces one executable artifact', () => {
  execFileSync('cargo', ['build', '--release', '--quiet'])
  const binary = 'target/release/cooldown-registry-proxy'
  assert.equal(existsSync(binary), true)
  assert.equal(statSync(binary).isFile(), true)
})

test('@claim:build-dist clean checkout build writes the binary and static site to dist', () => {
  const root = mkdtempSync(join(tmpdir(), 'cooldown-clean-build-'))
  const checkout = join(root, 'checkout')
  try {
    execFileSync('git', ['clone', '--quiet', '--no-local', '--depth', '1', repositoryRoot, checkout])
    assert.equal(existsSync(join(checkout, 'node_modules')), false)
    assert.equal(existsSync(join(checkout, 'target')), false)
    assert.equal(existsSync(join(checkout, 'dist')), false)
    execFileSync('npm', ['ci', '--ignore-scripts'], { cwd: checkout, stdio: 'pipe' })
    execFileSync('npm', ['run', 'build'], { cwd: checkout, stdio: 'pipe' })
    assert.equal(statSync(join(checkout, 'dist/bin/cooldown-registry-proxy')).isFile(), true)
    assert.equal(statSync(join(checkout, 'dist/site/index.html')).isFile(), true)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('@claim:configured-local-output serve writes cache and refusal data only to configured paths', async () => {
  await withProductionServe(async ({ root, runtimeCwd, cacheDir, auditLog, proxyUrl }) => {
    const allowed = await proxyRequest(proxyUrl, '/npm-tarball/claim-npm/1.0.0/claim-npm-1.0.0.tgz')
    const blocked = await proxyRequest(proxyUrl, '/npm-tarball/claim-npm/2.0.0/claim-npm-2.0.0.tgz')
    assert.equal(allowed.status, 200)
    assert.equal(allowed.body, 'allowed-package-bytes')
    assert.equal(blocked.status, 404)
    assert.equal(readFileSync(auditLog, 'utf8').trim().split('\n').length, 1)
    assert.ok(readdirSync(cacheDir, { recursive: true }).length > 0)
    assert.equal(existsSync(join(runtimeCwd, 'data')), false)
    assert.equal(relative(root, cacheDir).startsWith('..'), false)
    assert.equal(relative(root, auditLog).startsWith('..'), false)
  })
})

test('@claim:mit-license project ships MIT source metadata and license text', () => {
  assert.match(readFileSync(new URL('../../LICENSE', import.meta.url), 'utf8'), /Permission is hereby granted, free of charge/)
  assert.match(readFileSync(new URL('../../Cargo.toml', import.meta.url), 'utf8'), /license = "MIT"/)
})

test('@claim:release-version displayed build ID matches package metadata', () => {
  const cargo = readFileSync(new URL('../../Cargo.toml', import.meta.url), 'utf8')
  const site = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(cargo, /version = "0\.1\.0"/)
  assert.match(site, /Built by Param Factory · v0\.1\.0/)
})
