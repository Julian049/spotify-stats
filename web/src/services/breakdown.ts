import type { Play } from '../model/play'
import { bestDay } from './timeline'

// The raw platform string includes OS versions and device models; we keep only the family.
export function platformFamily(platform: string | null): string {
  const p = (platform ?? '').toLowerCase()
  if (p.startsWith('android')) return 'Android'
  if (p.startsWith('windows')) return 'Windows'
  if (p.startsWith('web_player')) return 'Web player'
  if (p.startsWith('linux')) return 'Linux'
  return 'Unknown'
}

// RF-8: time listened per device family, most listened first.
export function msByPlatform(plays: Play[]) {
  const families = new Map<string, number>()
  for (const p of plays) {
    const family = platformFamily(p.platform)
    families.set(family, (families.get(family) ?? 0) + p.msPlayed)
  }
  return [...families].map(([name, ms]) => ({ name, ms })).sort((a, b) => b.ms - a.ms)
}

// RF-10: time listened with shuffle on and off. Records with a null shuffle are left out.
export function msByShuffle(plays: Play[]) {
  let on = 0
  let off = 0
  for (const p of plays) {
    if (p.shuffle === true) on += p.msPlayed
    else if (p.shuffle === false) off += p.msPlayed
  }
  return { on, off }
}

// RF-11: time listened offline and the offline day with the most listening.
export function offlineStats(plays: Play[]) {
  const offline = plays.filter((p) => p.offline === true)
  return {
    ms: offline.reduce((sum, p) => sum + p.msPlayed, 0),
    bestDay: bestDay(offline),
  }
}
