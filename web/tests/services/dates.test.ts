import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { filterByRange, localDate } from '../../src/services/dates'

const at = (ts: string) => ({ ts }) as Play

describe('localDate', () => {
  it('moves 02:00 UTC to the previous day at 21:00 in UTC-5', () => {
    expect(localDate('2024-01-02T02:00:00Z')).toBe('2024-01-01')
  })
})

describe('filterByRange', () => {
  const plays = [at('2024-01-01T10:00:00Z'), at('2024-01-02T02:00:00Z'), at('2024-01-03T10:00:00Z')]

  it('keeps both limits, using the local day', () => {
    // the second record is Jan 1 at 21:00 in Colombia
    expect(filterByRange(plays, '2024-01-01', '2024-01-01')).toHaveLength(2)
  })

  it('applies no limit when null', () => {
    expect(filterByRange(plays, null, null)).toHaveLength(3)
    expect(filterByRange(plays, '2024-01-03', null)).toHaveLength(1)
  })
})
