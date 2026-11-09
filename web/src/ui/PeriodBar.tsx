import { useState } from 'react'
import calendar from '../assets/icons/calendar.svg'
import type { Preset, Range } from '../services/period'
import { shortDate } from './format'
import './period.css'

type Props = {
  preset: Preset | null // null = custom range
  range: Range
  firstDay: string
  lastDay: string
  onPreset: (preset: Preset) => void
  onCustom: (range: Range) => void
}

export default function PeriodBar({ preset, range, firstDay, lastDay, onPreset, onCustom }: Props) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(range.from ?? firstDay)
  const [to, setTo] = useState(range.to ?? lastDay)

  const presets: { id: Preset; label: string }[] = [
    { id: 'weeks', label: 'Últimas 4 semanas' },
    { id: 'months', label: 'Últimos 6 meses' },
    { id: 'year', label: lastDay.slice(0, 4) },
    { id: 'all', label: 'Todo el historial' },
  ]

  function toggle() {
    setFrom(range.from ?? firstDay)
    setTo(range.to ?? lastDay)
    setOpen(!open)
  }

  function apply(e: React.FormEvent) {
    e.preventDefault()
    onCustom({ from, to })
    setOpen(false)
  }

  // Never show days outside the history, even when a preset reaches further.
  const shownFrom = range.from && range.from > firstDay ? range.from : firstDay
  const shownTo = range.to && range.to < lastDay ? range.to : lastDay

  return (
    <div className="period">
      <div className="presets" role="group" aria-label="Período">
        {presets.map((p) => (
          <button key={p.id} aria-pressed={preset === p.id} onClick={() => onPreset(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="range">
        <button className="range-button" aria-expanded={open} onClick={toggle}>
          <img src={calendar} alt="" width={15} height={15} />
          {shortDate(shownFrom)} – {shortDate(shownTo)}
        </button>
        {open && (
          <form className="range-popover card" onSubmit={apply}>
            <label>
              Desde
              <input type="date" value={from} min={firstDay} max={to} onChange={(e) => setFrom(e.target.value)} required />
            </label>
            <label>
              Hasta
              <input type="date" value={to} min={from} max={lastDay} onChange={(e) => setTo(e.target.value)} required />
            </label>
            <button className="pill-button" type="submit">
              Aplicar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
