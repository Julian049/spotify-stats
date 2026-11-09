import { useMemo, useRef, useState } from 'react'
import { filterByRange, localDate } from '../services/dates'
import { demoPlays } from '../services/demo'
import { parseHistory } from '../services/historyParser'
import { presetRange, type Preset, type Range } from '../services/period'
import { dedupe, totals } from '../services/stats'
import Header, { type View } from './Header'
import HabitsView from './HabitsView'
import PeriodBar from './PeriodBar'
import SummaryView from './SummaryView'
import TopsView from './TopsView'
import UploadView, { type LoadedFile } from './UploadView'

export default function App() {
  const [files, setFiles] = useState<LoadedFile[]>([])
  const [view, setView] = useState<View>('upload')
  const [preset, setPreset] = useState<Preset | null>('all')
  const [range, setRange] = useState<Range>({ from: null, to: null })
  const nextId = useRef(1)

  const plays = useMemo(() => dedupe(files.flatMap((f) => f.plays ?? [])), [files])
  const all = useMemo(() => totals(plays), [plays])
  const firstDay = all.from ? localDate(all.from) : ''
  const lastDay = all.to ? localDate(all.to) : ''
  const filtered = useMemo(() => filterByRange(plays, range.from, range.to), [plays, range])

  function addFiles(list: FileList) {
    const added = [...list].map((file) => ({ file, id: nextId.current++ }))
    setFiles((prev) => [...prev, ...added.map(({ file, id }) => ({ id, name: file.name, size: file.size, plays: null, error: false }))])
    for (const { file, id } of added) {
      file
        .text()
        .then((text) => {
          const parsed = parseHistory(text)
          if (parsed.length === 0) throw new Error('No plays in this file')
          return parsed
        })
        .then(
          (parsed) => setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, plays: parsed } : f))),
          () => setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, error: true } : f))),
        )
    }
  }

  function choosePreset(p: Preset) {
    setPreset(p)
    setRange(presetRange(p, lastDay))
  }

  function navigate(next: View) {
    setView(next)
    window.scrollTo(0, 0)
  }

  function analyze() {
    setPreset('all')
    setRange({ from: null, to: null })
    navigate('summary')
  }

  if (view === 'upload' || plays.length === 0) {
    return (
      <>
        <Header view="upload" onNavigate={navigate} />
        <UploadView
          files={files}
          totalPlays={all.plays}
          onAdd={addFiles}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          onClear={() => setFiles([])}
          onDemo={() => {
            setFiles([{ id: nextId.current++, name: 'Datos de ejemplo', size: 0, plays: demoPlays(), error: false }])
            analyze()
          }}
          onAnalyze={analyze}
        />
      </>
    )
  }

  const periodBar = (
    <PeriodBar
      preset={preset}
      range={range}
      firstDay={firstDay}
      lastDay={lastDay}
      onPreset={choosePreset}
      onCustom={(r) => {
        setPreset(null)
        setRange(r)
      }}
    />
  )

  return (
    <>
      <Header view={view} onNavigate={navigate} />
      {view === 'summary' && <SummaryView plays={filtered} allPlays={plays} range={range} periodBar={periodBar} onNavigate={navigate} />}
      {view === 'tops' && <TopsView plays={filtered} periodBar={periodBar} />}
      {view === 'habits' && <HabitsView plays={filtered} periodBar={periodBar} />}
    </>
  )
}
