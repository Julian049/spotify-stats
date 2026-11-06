import { useState } from 'react'
import { parseHistory, type Play } from './history'
import { dedupe, distinctValues, totals } from './stats'

export default function App() {
  const [plays, setPlays] = useState<Play[]>([])
  const [duplicates, setDuplicates] = useState(0)
  const [error, setError] = useState<string | null>(null)

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

  const t = totals(plays)

  return (
    <main>
      <h1>Spotify Stats</h1>
      <input type="file" accept=".json" multiple onChange={(e) => onFiles(e.target.files)} />
      {error && <p>{error}</p>}
      {plays.length > 0 && (
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
      )}
    </main>
  )
}
