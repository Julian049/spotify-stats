import { useState } from 'react'
import type { Play } from '../model/play'
import { parseHistory } from '../services/historyParser'
import { filterByRange } from '../services/dates'
import { dedupe, distinctValues, totals } from '../services/stats'
import { top, topByMonth, type Ranked, type TopBy } from '../services/tops'

export default function App() {
  const [plays, setPlays] = useState<Play[]>([])
  const [duplicates, setDuplicates] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  async function onFiles(files: FileList | null) {
    if (!files) return
    setError(null)
    try {
      const all: Play[] = []
      for (const file of files) {
        all.push(...parseHistory(await file.text()))
      }
      const unique = dedupe(all)
      setDuplicates(all.length - unique.length)
      setPlays(unique)
    } catch {
      setError('Could not read the files. Are they Spotify history JSON files?')
    }
  }

  const filtered = filterByRange(plays, from || null, to || null)
  const t = totals(filtered)

  return (
    <main>
      <h1>Spotify Stats</h1>
      <input type="file" accept=".json" multiple onChange={(e) => onFiles(e.target.files)} />
      {error && <p>{error}</p>}
      {plays.length > 0 && (
        <>
          <p>
            From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            {' '}to <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </p>
          <ul>
            <li>Plays: {t.plays}</li>
            <li>Listened: {Math.round(t.listenedMs / 60_000)} min</li>
            <li>Tracks: {t.tracks}</li>
            <li>Artists: {t.artists}</li>
            <li>Albums: {t.albums}</li>
            <li>From {t.from} to {t.to}</li>
            <li>Duplicates removed: {duplicates}</li>
            <li>reason_start: {distinctValues(plays, 'reasonStart').join(', ')}</li>
            <li>reason_end: {distinctValues(plays, 'reasonEnd').join(', ')}</li>
            <li>platform: {distinctValues(plays, 'platform').join(', ')}</li>
          </ul>
          {(['artist', 'track', 'album'] as TopBy[]).map((by) => (
            <div key={by}>
              <h2>Top {by}s</h2>
              <TopList title="By time" items={top(filtered, by, 'time', 10)} />
              <TopList title="By plays" items={top(filtered, by, 'plays', 10)} />
            </div>
          ))}
          <h2>Top per month</h2>
          <ul>
            {topByMonth(filtered, 'artist').map((m) => (
              <li key={m.month}>{m.month}: {m.name}</li>
            ))}
          </ul>
          <ul>
            {topByMonth(filtered, 'album').map((m) => (
              <li key={m.month}>{m.month}: {m.name}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

function TopList({ title, items }: { title: string; items: Ranked[] }) {
  return (
    <>
      <h3>{title}</h3>
      <ol>
        {items.map((item) => (
          <li key={item.name}>{item.name} ({item.plays} plays, {Math.round(item.ms / 60_000)} min)</li>
        ))}
      </ol>
    </>
  )
}
