import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { top, topByMonth } from '../../src/services/tops'

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

describe('top', () => {
  // A: 1 long play. B: 3 short plays above 30 s.
  const plays = [
    play({ artist: 'A', msPlayed: 600_000 }),
    play({ artist: 'B', msPlayed: 40_000 }),
    play({ artist: 'B', msPlayed: 40_000 }),
    play({ artist: 'B', msPlayed: 40_000 }),
  ]

  it('differs when sorted by time or by plays', () => {
    expect(top(plays, 'artist', 'time', 5)[0].name).toBe('A')
    expect(top(plays, 'artist', 'plays', 5)[0].name).toBe('B')
  })

  it('limits the list to n', () => {
    expect(top(plays, 'artist', 'time', 1)).toHaveLength(1)
  })

  it('does not count plays under 30 s but does count their time', () => {
    const [a] = top([play({ msPlayed: 10_000 })], 'artist', 'time', 1)
    expect([a.plays, a.ms]).toEqual([0, 10_000])
  })

  it('keeps the first track uri of the group, skipping plays without one', () => {
    const [a] = top([play({ uri: null }), play({ uri: 'spotify:track:x' }), play({ uri: 'spotify:track:y' })], 'artist', 'time', 1)
    expect(a.uri).toBe('spotify:track:x')
  })
})

describe('topByMonth', () => {
  it('returns the most listened artist of each month', () => {
    const plays = [
      play({ ts: '2024-01-15T12:00:00Z', artist: 'A' }),
      play({ ts: '2024-02-15T12:00:00Z', artist: 'B' }),
    ]
    expect(topByMonth(plays, 'artist').map((m) => [m.month, m.name])).toEqual([
      ['2024-01', 'A'],
      ['2024-02', 'B'],
    ])
  })
})

describe('top fields', () => {
  it('keeps title, artist and album apart for a track', () => {
    const [t] = top([play({ track: 'Song', artist: 'Singer', album: 'Record' })], 'track', 'plays', 1)
    expect([t.title, t.artist, t.album]).toEqual(['Song', 'Singer', 'Record'])
  })
})
