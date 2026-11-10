import type { Play } from '../model/play'
import { localHour } from './dates'
import { PLAY_THRESHOLD_MS } from './stats'

const IMMEDIATE_MS = 10_000

// Share of records by how long they played: 30 s or more, under 10 s, and 10 to 30 s.
export function skipBuckets(plays: Play[]) {
  let immediate = 0
  let early = 0
  for (const p of plays) {
    if (p.msPlayed < IMMEDIATE_MS) immediate++
    else if (p.msPlayed < PLAY_THRESHOLD_MS) early++
  }
  const total = plays.length || 1
  return {
    listened: (plays.length - immediate - early) / total,
    immediate: immediate / total,
    early: early / total,
  }
}

// Time listened offline and online. A null offline flag counts as online.
export function onlineOffline(plays: Play[]) {
  let offlineMs = 0
  let onlineMs = 0
  for (const p of plays) {
    if (p.offline === true) offlineMs += p.msPlayed
    else onlineMs += p.msPlayed
  }
  return { offlineMs, onlineMs }
}

// Share of the time listened between two local hours, from included and to excluded. It can wrap midnight (22 to 6).
export function shareOfHours(plays: Play[], from: number, to: number): number {
  let inside = 0
  let total = 0
  for (const p of plays) {
    const h = localHour(p.ts)
    const isInside = from <= to ? h >= from && h < to : h >= from || h < to
    if (isInside) inside += p.msPlayed
    total += p.msPlayed
  }
  return total ? inside / total : 0
}

// The local hour with the most time listened, or null without plays.
export function peakHour(plays: Play[]): number | null {
  const hours = Array<number>(24).fill(0)
  for (const p of plays) hours[localHour(p.ts)] += p.msPlayed
  const max = Math.max(...hours)
  return max > 0 ? hours.indexOf(max) : null
}
