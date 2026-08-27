export const RELEASES = [
  { ecosystem: 'npm', name: 'signal-router', version: '4.8.0', ageHours: 18, advisory: false },
  { ecosystem: 'PyPI', name: 'field-notes', version: '2.3.1', ageHours: 240, advisory: false },
  { ecosystem: 'Cargo', name: 'vault-door', version: '0.9.6', ageHours: 768, advisory: true }
]

export function evaluateRelease(release, cooldownDays, offline = false) {
  if (release.advisory) {
    return { state: 'blocked', label: 'Hard blocked', detail: 'Advisory MAL-2026-041 wins over age and exclusions.' }
  }
  if (offline && release.ageHours < 48) {
    return { state: 'offline', label: 'Cache miss', detail: 'Offline mode refuses uncached metadata with HTTP 503.' }
  }
  const cooldownHours = cooldownDays * 24
  if (release.ageHours < cooldownHours) {
    const hoursLeft = cooldownHours - release.ageHours
    const roundedDays = Math.ceil(hoursLeft / 24)
    return { state: 'quarantine', label: 'Quarantined', detail: `${roundedDays}d until this version crosses the contour.` }
  }
  return { state: 'allowed', label: offline ? 'Served from cache' : 'Allowed', detail: offline ? 'A verified immutable artifact is already cached.' : 'Older than the active cooldown.' }
}

export function policySummary(releases, cooldownDays, offline = false) {
  return releases.reduce((summary, release) => {
    const result = evaluateRelease(release, cooldownDays, offline)
    summary[result.state] = (summary[result.state] || 0) + 1
    return summary
  }, {})
}

