import type { Play } from '../model/play'
import { msByPlatform, msByShuffle, offlineStats } from '../services/breakdown'
import { skipStats, topSkipped } from '../services/skips'
import { bestDay, heatmap, longestStreak, msPerMonth, obsession } from '../services/timeline'

const minutes = (ms: number) => Math.round(ms / 60_000)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MoreStats({ plays }: { plays: Play[] }) {
  const day = bestDay(plays)
  const streak = longestStreak(plays)
  const fav = obsession(plays)
  const shuffle = msByShuffle(plays)
  const offline = offlineStats(plays)
  const skips = skipStats(plays)

  return (
    <>
      <h2>Highlights</h2>
      <ul>
        {day && <li>Best day: {day.day} ({minutes(day.ms)} min)</li>}
        <li>Longest streak: {streak.days} days ({streak.from} to {streak.to})</li>
        {fav && <li>Obsession: {fav.name} ({fav.plays} plays on {fav.day})</li>}
        <li>Shuffle on: {minutes(shuffle.on)} min, off: {minutes(shuffle.off)} min</li>
        <li>
          Offline: {minutes(offline.ms)} min
          {offline.bestDay && `, best day ${offline.bestDay.day} (${minutes(offline.bestDay.ms)} min)`}
        </li>
        <li>Skipped: {skips.skipped} of {skips.total} ({skips.percent.toFixed(1)}%)</li>
      </ul>

      <h2>Time per month (min)</h2>
      <ul>
        {msPerMonth(plays).map((m) => (
          <li key={m.month}>{m.month}: {minutes(m.ms)}</li>
        ))}
      </ul>

      <h2>Platform (min)</h2>
      <ul>
        {msByPlatform(plays).map((p) => (
          <li key={p.name}>{p.name}: {minutes(p.ms)}</li>
        ))}
      </ul>

      <h2>Most skipped</h2>
      <ol>
        {topSkipped(plays, 'artist', 10).map((a) => (
          <li key={a.name}>{a.name} ({a.skips})</li>
        ))}
      </ol>
      <ol>
        {topSkipped(plays, 'track', 10).map((t) => (
          <li key={t.name}>{t.name} ({t.skips})</li>
        ))}
      </ol>

      <h2>Heatmap (min, day x hour)</h2>
      <table border={1} cellPadding={2}>
        <tbody>
          {heatmap(plays).map((row, i) => (
            <tr key={DAYS[i]}>
              <th>{DAYS[i]}</th>
              {row.map((ms, hour) => (
                <td key={hour}>{minutes(ms)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
