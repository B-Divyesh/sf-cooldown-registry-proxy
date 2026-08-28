import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'

function runDemo(check) {
  const output = execFileSync('cargo', ['run', '--quiet', '--', '--json', 'demo'], { encoding: 'utf8' })
  const result = JSON.parse(output)
  try { check(result) } finally { rmSync(result.workspace, { recursive: true, force: true }) }
}

function decision(result, ecosystem) {
  return result.report.decisions.find((item) => item.ecosystem === ecosystem)
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

test('@claim:refusal-jsonl every sample refusal is an append-only JSONL record', () => {
  runDemo((result) => {
    const rows = readFileSync(result.audit_log, 'utf8').trim().split('\n').map(JSON.parse)
    assert.equal(rows.length, result.report.audit_records)
    assert.equal(rows.length, 4)
    assert.deepEqual(new Set(rows.map((row) => row.action)), new Set(['cooldown_block', 'advisory_block']))
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
