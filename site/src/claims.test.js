import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { evaluateRelease, RELEASES } from './policy.js'

test('@claim:cooldown-block bundled fresh npm release stays blocked at seven days', () => {
  const result = evaluateRelease(RELEASES[0], 7)
  assert.equal(result.state, 'quarantine')
  assert.match(result.detail, /remain before this version is allowed/)
})

test('@claim:advisory-block bundled Cargo release is blocked by its advisory', () => {
  const result = evaluateRelease(RELEASES[2], 1)
  assert.equal(result.state, 'blocked')
  assert.match(result.detail, /MAL-2026-041/)
})

test('demo isolation code names only a demo: storage key and skips license state', () => {
  const source = readFileSync(new URL('./main.js', import.meta.url), 'utf8')
  assert.match(source, /const DEMO_KEY = 'demo:cooldown-registry-proxy:policy'/)
  assert.match(source, /if \(isDemo && cooldown && offline\)/)
  assert.doesNotMatch(source, /sb_license:|api\.sociobot\.in|LICENSE_KEY/)
})

test('@claim:cli-demo-workspace demo command creates an isolated workspace with bundled policy', () => {
  const output = execFileSync('cargo', ['run', '--quiet', '--', '--json', 'demo'], { encoding: 'utf8' })
  const result = JSON.parse(output)
  assert.equal(result.ok, true)
  assert.equal(result.policy.exclusions, 1)
  assert.equal(result.policy.blocked, 1)
  assert.equal(existsSync(result.workspace), true)
  assert.equal(existsSync(`${result.workspace}/policy/exclusions.json`), true)
  rmSync(result.workspace, { recursive: true, force: true })
})

test('@claim:mit-license project ships MIT source metadata and license text', () => {
  assert.match(readFileSync(new URL('../../LICENSE', import.meta.url), 'utf8'), /Permission is hereby granted, free of charge/)
  assert.match(readFileSync(new URL('../../Cargo.toml', import.meta.url), 'utf8'), /license = "MIT"/)
})
