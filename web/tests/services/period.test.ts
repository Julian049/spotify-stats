import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, presetRange, previousRange } from '../../src/services/period'

describe('presetRange', () => {
  it('counts back from the last day of the history', () => {
    expect(presetRange('weeks', '2024-03-31')).toEqual({ from: '2024-03-04', to: '2024-03-31' })
    expect(presetRange('months', '2024-08-31')).toEqual({ from: '2024-03-01', to: '2024-08-31' })
    expect(presetRange('months', '2024-08-15')).toEqual({ from: '2024-02-16', to: '2024-08-15' })
    expect(presetRange('year', '2024-08-31')).toEqual({ from: '2024-01-01', to: '2024-12-31' })
    expect(presetRange('all', '2024-08-31')).toEqual({ from: null, to: null })
  })
})

describe('previousRange', () => {
  it('returns the same number of days right before', () => {
    expect(previousRange('2023-01-01', '2023-12-31')).toEqual({ from: '2022-01-01', to: '2022-12-31' })
    expect(daysBetween('2024-03-04', '2024-03-31')).toBe(28)
  })

  it('crosses month and leap day boundaries', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29')
  })
})
