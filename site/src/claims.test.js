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

async function unusedPort() {
  const server = createServer()
  const port = await listen(server)
  await new Promise((resolve) => server.close(resolve))
  return port
}

function createRegistry() {
  return createServer((request, response) => {
    const base = `http://${request.headers.host}`
    if (request.url === '/claim-package') {
      const old = new Date(Date.now() - 10 * 86_400_000).toISOString()
      const fresh = new Date(Date.now() - 60 * 60_000).toISOString()
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({
        name: 'claim-package',
        'dist-tags': { latest: '3.0.0' },
        time: { '1.0.0': old, '2.0.0': fresh, '3.0.0': old },
        versions: {
          '1.0.0': { dist: { tarball: `${base}/claim-package-1.0.0.tgz` } },
          '2.0.0': { dist: { tarball: `${base}/claim-package-2.0.0.tgz` } },
          '3.0.0': { dist: { tarball: `${base}/claim-package-3.0.0.tgz` } }
        }
      }))
      return
    }
    if (request.url === '/claim-package-1.0.0.tgz') {
      response.writeHead(200, { 'Content-Type': 'application/octet-stream' })
      response.end('allowed-package-bytes')
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
  const advisories = join(root, 'advisories.json')
  mkdirSync(runtimeCwd)
  writeFileSync(advisories, JSON.stringify({ blocked: [{
    ecosystem: 'npm', package: 'claim-package', version: '3.0.0',
    id: 'CLAIM-ADVISORY-1', reason: 'Claim fixture'
  }] }))
  const upstream = createRegistry()
  const upstreamPort = await listen(upstream)
  const upstreamUrl = `http://127.0.0.1:${upstreamPort}`
  const proxyPort = await unusedPort()
  const proxyUrl = `http://127.0.0.1:${proxyPort}`
  const binary = join(repositoryRoot, 'target/debug/cooldown-registry-proxy')
  const child = spawn(binary, [
    'serve', '--listen', `127.0.0.1:${proxyPort}`, '--public-url', proxyUrl,
    '--cooldown', '7d', '--cache-ttl', '1s', '--cache-dir', cacheDir,
    '--audit-log', auditLog, '--advisories', advisories,
    '--npm-upstream', upstreamUrl, '--pypi-upstream', upstreamUrl,
    '--cargo-index-upstream', upstreamUrl, '--crates-api-upstream', upstreamUrl
  ], { cwd: runtimeCwd, stdio: ['ignore', 'pipe', 'pipe'] })
  let diagnostics = ''
  child.stdout.on('data', (chunk) => { diagnostics += chunk })
  child.stderr.on('data', (chunk) => { diagnostics += chunk })
  try {
    await waitForReady(proxyUrl, child)
    await check({ root, runtimeCwd, cacheDir, auditLog, proxyUrl })
  } catch (error) {
    error.message = `${error.message}\nproxy output:\n${diagnostics}`
    throw error
  } finally {
    child.kill('SIGTERM')
    await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(2_000)])
    await new Promise((resolve) => upstream.close(resolve))
    rmSync(root, { recursive: true, force: true })
  }
}

async function request(proxyUrl, version) {
  const response = await fetch(`${proxyUrl}/npm-tarball/claim-package/${version}/claim-package-${version}.tgz`)
  return { status: response.status, body: await response.text() }
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

test('@claim:refusal-jsonl every production refusal is an append-only JSONL record', async () => {
  await withProductionServe(async ({ auditLog, proxyUrl }) => {
    const cooldown = await request(proxyUrl, '2.0.0')
    const advisory = await request(proxyUrl, '3.0.0')
    assert.equal(cooldown.status, 404)
    assert.equal(advisory.status, 451)
    const responses = [JSON.parse(cooldown.body), JSON.parse(advisory.body)]
    const rows = readFileSync(auditLog, 'utf8').trim().split('\n').map(JSON.parse)
    assert.equal(rows.length, responses.length)
    assert.deepEqual(rows.map((row) => row.action), ['cooldown_block', 'advisory_block'])
    assert.deepEqual(rows.map((row) => row.request_id), responses.map((item) => item.request_id))
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

test('@claim:cli-demo-isolation installed binary ignores existing working-directory data', () => {
  execFileSync('cargo', ['build', '--quiet'])
  const cwd = mkdtempSync(join(tmpdir(), 'cooldown-existing-data-'))
  const existing = join(cwd, 'data')
  const sentinel = join(existing, 'refusals.jsonl')
  mkdirSync(existing)
  writeFileSync(sentinel, 'real settings stay untouched')
  const binary = new URL('../../target/debug/cooldown-registry-proxy', import.meta.url).pathname
  const output = execFileSync(binary, ['--json', 'demo'], { cwd, encoding: 'utf8' })
  const result = JSON.parse(output)
  try {
    assert.equal(readFileSync(sentinel, 'utf8'), 'real settings stay untouched')
    assert.equal(relative(cwd, result.workspace).startsWith('..'), true)
  } finally {
    rmSync(result.workspace, { recursive: true, force: true })
    rmSync(cwd, { recursive: true, force: true })
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

test('@claim:configured-outbound demo proxy contacts only its configured fixture registry', () => {
  runDemo((result) => assert.deepEqual(result.report.upstream_requests, [
    '/signal-router',
    '/pypi/field-notes/json',
    '/files/field_notes-2.3.1-py3-none-any.whl',
    '/va/ul/vault-door',
    '/api/v1/crates/vault-door'
  ]))
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
    const allowed = await request(proxyUrl, '1.0.0')
    const blocked = await request(proxyUrl, '2.0.0')
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
