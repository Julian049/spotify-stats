import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { bestDay, heatmap, longestStreak, msPerMonth, obsession } from '../../src/services/timeline'

const play = (over: Partial<Play>): Play => ({
  ts: '2024-01-15T12:00:00Z',
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

describe('msPerMonth', () => {
  it('sums time per local month', () => {
    // 2024-02-01T02:00Z is still January 31 in Colombia
    const plays = [play({ ts: '2024-02-01T02:00:00Z' }), play({ ts: '2024-02-01T12:00:00Z' })]
    expect(msPerMonth(plays)).toEqual([
      { month: '2024-01', ms: 60_000 },
      { month: '2024-02', ms: 60_000 },
    ])
  })
})

describe('heatmap', () => {
  it('puts a 02:00 UTC play on the previous day at hour 21', () => {
    // 2024-01-02 is a Tuesday, so the local day is Monday Jan 1 (row 0)
    const grid = heatmap([play({ ts: '2024-01-02T02:00:00Z' })])
    expect(grid[0][21]).toBe(60_000)
  })
})

describe('bestDay', () => {
  it('returns the local day with the most time', () => {
    const plays = [play({ ts: '2024-01-10T12:00:00Z' }), play({ ts: '2024-01-11T12:00:00Z', msPlayed: 90_000 })]
    expect(bestDay(plays)).toEqual({ day: '2024-01-11', ms: 90_000 })
  })
})

describe('longestStreak', () => {
  it('finds the longest run of consecutive days', () => {
    const days = ['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05', '2024-01-06']
    const plays = days.map((d) => play({ ts: `${d}T12:00:00Z` }))
    expect(longestStreak(plays)).toEqual({ days: 3, from: '2024-01-04', to: '2024-01-06' })
  })
})

describe('obsession', () => {
  it('returns the track with the most plays in one day', () => {
    const plays = [
      play({ uri: 'a', track: 'One' }),
      play({ uri: 'b', track: 'Two' }),
      play({ uri: 'b', track: 'Two' }),
      play({ uri: 'a', track: 'One', ts: '2024-01-16T12:00:00Z' }),
    ]
    expect(obsession(plays)).toMatchObject({ name: 'Two - A', plays: 2 })
  })
})
