import './style.css'
import { RELEASES, evaluateRelease, policySummary } from './policy.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

const cooldown = $('#cooldown')
const cooldownOutput = $('#cooldown-output')
const offline = $('#offline-mode')
const releaseList = $('#release-list')
const demoStatus = $('#demo-status')

function renderDemo() {
  const days = Number(cooldown.value)
  cooldownOutput.value = `${days} days`
  releaseList.replaceChildren(...RELEASES.map((release) => {
    const result = evaluateRelease(release, days, offline.checked)
    const item = document.createElement('li')
    item.className = `release release--${result.state}`
    item.innerHTML = `<span class="release__pin" aria-hidden="true"></span><span class="release__identity"><b>${release.name}</b><span>${release.ecosystem} · v${release.version} · ${Math.round(release.ageHours / 24 * 10) / 10}d old</span></span><span class="release__result"><b>${result.label}</b><span>${result.detail}</span></span>`
    return item
  }))
  const summary = policySummary(RELEASES, days, offline.checked)
  demoStatus.textContent = `Policy recalculated: ${summary.allowed || 0} allowed, ${summary.quarantine || 0} quarantined, ${summary.blocked || 0} hard blocked, ${summary.offline || 0} offline cache misses.`
}

cooldown?.addEventListener('input', renderDemo)
offline?.addEventListener('change', renderDemo)
if (cooldown) renderDemo()

const snippets = {
  npm: 'npm config set registry https://registry.internal/npm/\nnpm install',
  pypi: 'pip install --index-url https://registry.internal/pypi/simple/ PACKAGE\n# uv: UV_INDEX_URL=https://registry.internal/pypi/simple/ uv sync',
  cargo: '[source.crates-io]\nreplace-with = "cooldown"\n\n[source.cooldown]\nregistry = "sparse+https://registry.internal/cargo/"'
}

const packageManager = $('#package-manager')
const installCode = $('#install-code')
packageManager?.addEventListener('change', () => { installCode.textContent = snippets[packageManager.value] })

$$('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy)
    const original = button.textContent
    try {
      await navigator.clipboard.writeText(target.textContent)
      button.textContent = 'Copied'
    } catch {
      button.textContent = 'Select to copy'
      const range = document.createRange()
      range.selectNodeContents(target)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
    setTimeout(() => { button.textContent = original }, 1800)
  })
})

const SLUG = 'cooldown-registry-proxy'
const API_BASE = 'https://api.sociobot.in/api/v1'
const LICENSE_KEY = `sb_license:${SLUG}`
const VERDICT_KEY = `${LICENSE_KEY}:verdict`
const DAY = 86_400_000

function showLicenseState(state, message) {
  const notice = $('#license-notice')
  const content = $('#operator-content')
  if (!notice || !content) return
  notice.dataset.state = state
  notice.textContent = message
  content.hidden = state !== 'valid'
}

async function verifyLicense(token, force = false) {
  let cached = null
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') } catch { localStorage.removeItem(VERDICT_KEY) }
  if (!force && cached?.token === token && Date.now() - cached.checkedAt < DAY) {
    showLicenseState(cached.valid ? 'valid' : 'invalid', cached.valid ? 'Operator Pack active on this browser.' : 'License no longer active. You can restore another license or purchase a new one.')
    return
  }
  if (cached?.token === token && cached.valid) showLicenseState('valid', 'Operator Pack active. Checking license quietly…')
  try {
    const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`)
    if (!response.ok) throw new Error('verification service unavailable')
    const verdict = await response.json()
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ token, valid: verdict.valid, checkedAt: Date.now(), expiresAt: verdict.expires_at }))
    showLicenseState(verdict.valid ? 'valid' : 'invalid', verdict.valid ? 'Operator Pack active on this browser.' : 'License no longer active. You can restore another license or purchase a new one.')
  } catch {
    if (!cached?.valid) showLicenseState('offline', 'License verification is temporarily offline. The free proxy and documentation remain available.')
  }
}

function initializeLicense() {
  const url = new URL(window.location.href)
  const returnedLicense = url.searchParams.get('license')
  if (returnedLicense) {
    localStorage.setItem(LICENSE_KEY, returnedLicense)
    url.searchParams.delete('license')
    history.replaceState({}, '', url)
  }
  const token = returnedLicense || localStorage.getItem(LICENSE_KEY)
  if (token) verifyLicense(token)
}

$('#restore-license')?.addEventListener('submit', (event) => {
  event.preventDefault()
  const input = $('#license-token')
  const token = input.value.trim()
  if (!token) return
  localStorage.setItem(LICENSE_KEY, token)
  verifyLicense(token, true)
  input.value = ''
})

initializeLicense()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
