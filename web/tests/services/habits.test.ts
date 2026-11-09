import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { onlineOffline, peakHour, shareOfHours, skipBuckets } from '../../src/services/habits'

const play = (over: Partial<Play>): Play => ({
  ts: '2024-01-15T17:00:00Z', // 12:00 in Colombia
  msPlayed: 60_000,
  track: 'T',
  artist: 'A',
  album: 'Al',
  uri: 'spotify:track:t',
  platform: null,
  reasonStart: null,
  reasonEnd: null,
  shuffle: null,
  skipped: null,
  offline: null,
  ...over,
})

describe('skipBuckets', () => {
  it('splits records by how long they played', () => {
    const plays = [play({ msPlayed: 5_000 }), play({ msPlayed: 15_000 }), play({ msPlayed: 30_000 }), play({})]
    expect(skipBuckets(plays)).toEqual({ listened: 0.5, immediate: 0.25, early: 0.25 })
  })

  it('returns zeros without plays', () => {
    expect(skipBuckets([])).toEqual({ listened: 0, immediate: 0, early: 0 })
  })
})

describe('onlineOffline', () => {
  it('counts a null offline flag as online', () => {
    expect(onlineOffline([play({ offline: true }), play({ offline: false }), play({ offline: null })])).toEqual({
      offlineMs: 60_000,
      onlineMs: 120_000,
    })
  })
})

describe('shareOfHours', () => {
  it('wraps around midnight', () => {
    const night = play({ ts: '2024-01-15T04:00:00Z' }) // 23:00 local
    const noon = play({})
    expect(shareOfHours([night, noon], 22, 6)).toBe(0.5)
    expect(shareOfHours([night, noon], 6, 12)).toBe(0)
  })
})

describe('peakHour', () => {
  it('returns the local hour with the most time', () => {
    expect(peakHour([play({}), play({}), play({ ts: '2024-01-15T04:00:00Z' })])).toBe(12)
    expect(peakHour([])).toBeNull()
  })
})
