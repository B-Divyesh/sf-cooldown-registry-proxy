import './style.css'
import { RELEASES, evaluateRelease, policySummary } from './policy.js'

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const isDemo = document.body.dataset.demo === 'true'
const DEMO_KEY = 'demo:cooldown-registry-proxy:policy'

if (!isDemo && new URL(window.location.href).searchParams.get('demo') === '1') window.location.replace('/demo/')

function announcePage() {
  const heading = $('main h1')
  if (!heading) return
  let announcer = $('#route-status')
  if (!announcer) {
    announcer = document.createElement('p')
    announcer.id = 'route-status'
    announcer.className = 'sr-only'
    announcer.setAttribute('aria-live', 'polite')
    document.body.append(announcer)
  }
  announcer.textContent = ''
  requestAnimationFrame(() => { announcer.textContent = `${document.title}. ${heading.textContent.trim()}` })
  heading.focus({ preventScroll: true })
}
window.addEventListener('pageshow', announcePage)
$('.skip-link')?.addEventListener('click', () => requestAnimationFrame(() => {
  const main = $('#main')
  main?.setAttribute('tabindex', '-1')
  main?.focus()
}))

const cooldown = $('#cooldown')
const cooldownOutput = $('#cooldown-output')
const offline = $('#offline-mode')
const releaseList = $('#release-list')
const demoStatus = $('#demo-status')

function demoState() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') } catch { return {} }
}
function saveDemo() {
  if (isDemo && cooldown && offline) localStorage.setItem(DEMO_KEY, JSON.stringify({ cooldown: cooldown.value, offline: offline.checked }))
}
function renderDemo() {
  if (!cooldown || !cooldownOutput || !releaseList) return
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
  demoStatus.textContent = `Sample policy recalculated: ${summary.allowed || 0} allowed, ${summary.cooldown || 0} blocked by cooldown, ${summary.blocked || 0} blocked by advisory, ${summary.offline || 0} cache misses.`
  saveDemo()
}
if (isDemo && cooldown && offline) {
  const saved = demoState()
  cooldown.value = saved.cooldown || '7'
  offline.checked = Boolean(saved.offline)
  cooldown.addEventListener('input', renderDemo)
  offline.addEventListener('change', renderDemo)
  $('#reset-demo')?.addEventListener('click', () => {
    localStorage.removeItem(DEMO_KEY)
    cooldown.value = '7'
    offline.checked = false
    renderDemo()
    demoStatus.textContent = 'Sample demo reset to the original 7-day policy.'
  })
  $('#start-real')?.addEventListener('click', () => localStorage.removeItem(DEMO_KEY))
  renderDemo()
}

const snippets = {
  npm: 'npm config set registry https://registry.internal/npm/\nnpm install',
  pypi: 'pip install --index-url https://registry.internal/pypi/simple/ PACKAGE\n# uv: UV_INDEX_URL=https://registry.internal/pypi/simple/ uv sync',
  cargo: '[source.crates-io]\nreplace-with = "cooldown"\n\n[source.cooldown]\nregistry = "sparse+https://registry.internal/cargo/"'
}
const packageManager = $('#package-manager')
const installCode = $('#install-code')
packageManager?.addEventListener('change', () => {
  installCode.textContent = snippets[packageManager.value]
  $('[data-copy]').textContent = `Copy ${packageManager.options[packageManager.selectedIndex].text.split(' ')[0]} config`
})
$$('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
  const target = document.getElementById(button.dataset.copy)
  const original = button.textContent
  try { await navigator.clipboard.writeText(target.textContent); button.textContent = 'Copied config' }
  catch {
    button.textContent = 'Select config to copy'
    const range = document.createRange(); range.selectNodeContents(target)
    window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range)
  }
  setTimeout(() => { button.textContent = original }, 1800)
}))

function showUpdate(registration) {
  if (document.querySelector('#update-notice')) return
  const notice = document.createElement('aside')
  notice.id = 'update-notice'; notice.className = 'update-notice'; notice.setAttribute('role', 'status')
  notice.innerHTML = '<span>A new field guide is ready.</span><button type="button">Update now</button>'
  $('footer')?.before(notice)
  $('button', notice)?.addEventListener('click', () => registration.waiting?.postMessage({ type: 'COOLDOWN_ACTIVATE_UPDATE' }))
}
if ('serviceWorker' in navigator) window.addEventListener('load', async () => {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const prompt = () => { if (registration.waiting && navigator.serviceWorker.controller) showUpdate(registration) }
    prompt()
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => { if (registration.installing?.state === 'installed') prompt() }))
  } catch { /* Static documentation remains usable without a worker. */ }
})
