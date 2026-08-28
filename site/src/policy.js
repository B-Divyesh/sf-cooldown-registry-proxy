export const RELEASES = [
  { ecosystem: 'npm', name: 'signal-router', version: '4.8.0', ageHours: 18, advisory: false },
  { ecosystem: 'PyPI', name: 'field-notes', version: '2.3.1', ageHours: 240, advisory: false },
  { ecosystem: 'Cargo', name: 'vault-door', version: '0.9.6', ageHours: 768, advisory: true }
]

export function evaluateRelease(release, cooldownDays, offline = false) {
  if (release.advisory) {
    return { state: 'blocked', label: 'Blocked by advisory', detail: 'MAL-2026-041 blocks this version.' }
  }
  if (offline && release.ageHours < 48) {
    return { state: 'offline', label: 'Cache miss', detail: 'The sample cache has no metadata for this release.' }
  }
  const cooldownHours = cooldownDays * 24
  if (release.ageHours < cooldownHours) {
    const hoursLeft = cooldownHours - release.ageHours
    const roundedDays = Math.ceil(hoursLeft / 24)
    return { state: 'cooldown', label: 'Blocked by cooldown', detail: `${roundedDays}d remain before this version is allowed.` }
  }
  return { state: 'allowed', label: offline ? 'Allowed from sample cache' : 'Allowed', detail: offline ? 'This sample release is already cached.' : 'This release is older than the cooldown.' }
}

export function policySummary(releases, cooldownDays, offline = false) {
  return releases.reduce((summary, release) => {
    const result = evaluateRelease(release, cooldownDays, offline)
    summary[result.state] = (summary[result.state] || 0) + 1
    return summary
  }, {})
}
