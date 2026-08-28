import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('claims manifest has one and only one tagged test for every claim', () => {
  const claims = JSON.parse(read('.factory/claims.json'))
  const sources = `${read('site/src/claims.test.js')}\n${read('site/browser/site.spec.js')}`
  const ids = claims.map((claim) => claim.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const claim of claims) {
    assert.equal(typeof claim.claim, 'string')
    assert.match(claim.test, new RegExp(`@claim:${claim.id}`))
    if (claim.test.startsWith('node ')) {
      assert.equal(claim.test, `node --test --test-name-pattern=@claim:${claim.id} site/src/claims.test.js`)
    }
    assert.equal(sources.split(`@claim:${claim.id}`).length - 1, 1)
  }
  const tags = [...sources.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1])
  assert.deepEqual(new Set(tags), new Set(ids))
})

test('round two production claims match their listed evidence', () => {
  const claims = new Map(JSON.parse(read('.factory/claims.json')).map((claim) => [claim.id, claim]))
  assert.equal(claims.size, 24)
  assert.match(claims.get('refusal-jsonl').claim, /Each blocked package version/)
  assert.match(read('site/index.html'), /Each blocked package version adds a refusal record/)
  assert.match(read('README.md'), /Each blocked\s+package version adds one JSONL refusal record/)
  assert.match(claims.get('build-dist').claim, /dist\/bin.+dist\/site/)
  assert.match(read('README.md'), /npm run build` writes the binary to `dist\/bin\/`/)
  assert.match(claims.get('configured-local-output').claim, /configured paths/)
  assert.match(read('site/privacy/index.html'), /cache and refusal log remain in the directory you choose/)
})

test('public copy uses plain words and keeps every sentence within 22 words', () => {
  const banned = /\b(?:leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|unlock|delightful|journey|ecosystem|AI-powered)\b/i
  const htmlSource = read('site/index.html')
  const htmlParagraphs = [...htmlSource.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)]
    .map((match) => match[1].replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' '))
  const markdown = read('README.md')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+.*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/<https?:\/\/[^>]+>/g, 'link')
  const copy = `${htmlParagraphs.join('\n')}\n${markdown}`
  assert.doesNotMatch(copy, banned)
  const sentences = [...htmlParagraphs, ...markdown.split(/\n\s*\n/)]
    .flatMap((paragraph) => paragraph.split(/[.!?]+(?:\s|$)/))
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean)
    assert.ok(words.length <= 22, `${words.length} words: ${sentence}`)
  }
})

test('catalog description is verb-first and no longer than 120 characters', () => {
  const description = read('.factory/catalog-description.txt').trim()
  assert.ok(description.length <= 120)
  assert.match(description, /^(?:Block|Check|Delay|Stop|Route|Enforce)\b/)
})

test('all public routes share legal links, factory credit, and build ID', () => {
  for (const path of ['site/index.html', 'site/demo/index.html', 'site/privacy/index.html', 'site/terms/index.html', 'site/404.html']) {
    const page = read(path)
    assert.match(page, /href="\/privacy\/"/)
    assert.match(page, /href="\/terms\/"/)
    assert.match(page, /Built by Param Factory · v0\.1\.0/)
  }
})

test('reviewed dead paid and versioned-download promises are absent', () => {
  const publicCopy = [
    'site/index.html',
    'site/demo/index.html',
    'site/privacy/index.html',
    'site/terms/index.html',
    'site/404.html',
    'README.md'
  ].map(read).join('\n')
  assert.doesNotMatch(publicCopy, /Buy Operator Pack|checkout|Get v0\.1\.0 on GitHub|one-time \$49|Five-minute deployment|Network-level package quarantine/i)
  assert.doesNotMatch(publicCopy, /policy active|registry\.internal · policy/i)
  assert.doesNotMatch(publicCopy, /factory deploys|owns publishing credentials/i)
  assert.match(read('site/index.html'), /Example: 7-day cooldown/)
  assert.equal(existsSync(new URL('site/public/operator-pack.md', root)), false)
})

test('earlier unproved claims and inconsistent product terms stay absent', () => {
  const publicCopy = [
    'site/index.html',
    'site/demo/index.html',
    'site/privacy/index.html',
    'site/terms/index.html',
    'site/404.html',
    'README.md'
  ].map(read).join('\n')
  for (const phrase of [
    /New dependencies wait at the boundary/i,
    /Releases cross only after policy clearance/i,
    /One network choke point/i,
    /No TLS interception/i,
    /Immutable artifact cache/i,
    /exactly what package managers see/i,
    /No request leaves your browser/i,
    /Direct URLs do not bypass the boundary/i,
    /Keep your existing public registries/i,
    /No wrapper or local plugin/i,
    /refreshed advisory feeds/i,
    /The proxy remains fully open and ungated/i,
    /Make [“\"]too new[”\"] unreachable/i,
    /small enough to understand/i,
    /Dependency age is a policy, not a suggestion/i,
    /Get v0\.1\.0 on GitHub/i,
    /build and run the container/i,
    /intentionally non-interactive/i,
    /documents every command/i,
    /stale cached response/i,
    /serves cache only/i,
    /receives no package-manager credentials/i
  ]) assert.doesNotMatch(publicCopy, phrase)
})
