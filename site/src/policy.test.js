import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateRelease, policySummary, RELEASES } from './policy.js'

test('young releases are quarantined by the selected contour', () => {
  assert.equal(evaluateRelease(RELEASES[0], 7).state, 'quarantine')
  assert.equal(evaluateRelease(RELEASES[1], 7).state, 'allowed')
})

test('advisory blocks always win over package age', () => {
  assert.equal(evaluateRelease(RELEASES[2], 1).state, 'blocked')
})

test('offline mode distinguishes a cache miss from a policy refusal', () => {
  assert.equal(evaluateRelease(RELEASES[0], 1, true).state, 'offline')
  assert.deepEqual(policySummary(RELEASES, 7), { quarantine: 1, allowed: 1, blocked: 1 })
})

