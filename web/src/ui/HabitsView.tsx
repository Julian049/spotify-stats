import { useState, type ReactNode } from 'react'
import cloudOff from '../assets/icons/cloud-off.svg'
import deviceLaptop from '../assets/icons/device-laptop.svg'
import devicePhone from '../assets/icons/device-phone.svg'
import deviceTv from '../assets/icons/device-tv.svg'
import deviceWeb from '../assets/icons/device-web.svg'
import devices from '../assets/icons/devices.svg'
import download from '../assets/icons/download.svg'
import downloadGreen from '../assets/icons/download-green.svg'
import flame from '../assets/icons/flame.svg'
import insights from '../assets/icons/insights-sm.svg'
import plane from '../assets/icons/plane.svg'
import repeat from '../assets/icons/repeat.svg'
import shield from '../assets/icons/shield.svg'
import skip from '../assets/icons/skip.svg'
import tileCalendar from '../assets/icons/tile-calendar.svg'
import tileMoon from '../assets/icons/tile-moon.svg'
import wifi from '../assets/icons/wifi.svg'
import type { Play } from '../model/play'
import { msByPlatform, offlineStats } from '../services/breakdown'
import { onlineOffline, peakHour, shareOfHours, skipBuckets } from '../services/habits'
import { topSkipped } from '../services/skips'
import { bestDay, longestStreak, obsession } from '../services/timeline'
import { hoursMinutes, longDate, minutes, num, percent, shortDate } from './format'
import './habits.css'

type Props = { plays: Play[]; periodBar: ReactNode }

const PLATFORMS: Record<string, { label: string; icon: string }> = {
  Android: { label: 'Android (celular)', icon: devicePhone },
  iOS: { label: 'iPhone (iOS)', icon: devicePhone },
  Windows: { label: 'Windows (escritorio)', icon: deviceLaptop },
  Mac: { label: 'Mac (escritorio)', icon: deviceLaptop },
  Linux: { label: 'Linux (escritorio)', icon: deviceLaptop },
  TV: { label: 'Smart TV / Cast', icon: deviceTv },
  'Web player': { label: 'Reproductor web', icon: deviceWeb },
  Unknown: { label: 'Otros dispositivos', icon: deviceWeb },
}
// The first bar is green and the rest get darker, as in the design.
const BAR_COLORS = ['var(--green)', '#353534', '#2a2a2a', '#201f1f']

function listenerType(hour: number) {
  if (hour < 6) return 'Oyente de madrugada'
  if (hour < 12) return 'Oyente matutino'
  if (hour < 19) return 'Oyente de tarde'
  return 'Oyente nocturno'
}

export default function HabitsView({ plays, periodBar }: Props) {
  const [generatedAt] = useState(() => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }))
  const skips = skipBuckets(plays)
  const skippedShare = skips.immediate + skips.early
  const [skippedSong] = topSkipped(plays, 'track', 1)
  const [skippedArtist] = topSkipped(plays, 'artist', 1)

  const { offlineMs, onlineMs } = onlineOffline(plays)
  const totalMs = offlineMs + onlineMs || 1
  const offline = offlineStats(plays)

  const platforms = msByPlatform(plays)
  const peak = peakHour(plays)
  const night = shareOfHours(plays, 22, 6)
  const record = bestDay(plays)
  const streak = longestStreak(plays)
  const fav = obsession(plays)

  return (
    <main className="page habits">
      <section className="page-head">
        <div className="page-head-text">
          <div className="habits-eyebrow">
            <span className="habits-chip">
              <span className="dot small" />
              Cómo escuchas
            </span>
            <span className="faint small">Basado en tu historial de Spotify</span>
          </div>
          <h1 className="habits-title">Hábitos de escucha y reproducción</h1>
          <p className="lead-muted">
            Cuánto saltas canciones, cuánto escuchas sin conexión, desde qué dispositivos y cuáles son tus récords.
          </p>
        </div>
        {periodBar}
      </section>

      <section className="habits-grid">
        <div className="panel">
          <h2 className="panel-title">
            <img src={skip} alt="" width={12} height={11} />
            Tasa de saltos
          </h2>
          <p className="skip-headline">
            <strong>{percent(skippedShare, 1)}</strong>
            <span className="muted small">
              saltadas antes de 30 s{skippedShare > 0 && ` (~1 de cada ${Math.round(1 / skippedShare)})`}
            </span>
          </p>
          <div className="split-bar thick">
            <span style={{ width: `${skips.listened * 100}%`, background: 'var(--green)' }} />
            <span style={{ width: `${skips.immediate * 100}%`, background: 'var(--amber)' }} />
            <span style={{ width: `${skips.early * 100}%`, background: 'var(--track)' }} />
          </div>
          <ul className="legend">
            <li>
              <span className="dot" />
              Escuchadas más de 30 s<strong>{percent(skips.listened, 1)}</strong>
            </li>
            <li className="muted">
              <span className="dot" style={{ background: 'var(--amber)' }} />
              Salto inmediato (menos de 10 s)<strong>{percent(skips.immediate, 1)}</strong>
            </li>
            <li className="faint">
              <span className="dot" style={{ background: 'var(--track)' }} />
              Salto temprano (10–30 s)<strong>{percent(skips.early, 1)}</strong>
            </li>
          </ul>
          <div className="facts">
            <p>
              <span className="muted">Canción más saltada:</span>
              <strong className="green ellipsis">
                {skippedSong ? skippedSong.name.replace(' - ', ' · ') : 'Ninguna'}
              </strong>
            </p>
            <p>
              <span className="muted">Artista más saltado:</span>
              <strong className="green ellipsis">{skippedArtist?.name ?? 'Ninguno'}</strong>
            </p>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">
            <img src={cloudOff} alt="" width={20} height={18} />
            Sin conexión vs. en línea
          </h2>
          <div className="connection">
            <div className="connection-box">
              <p className="connection-label">
                <img src={downloadGreen} alt="" width={14} height={14} />
                Sin conexión
              </p>
              <p className="connection-value">
                {num(minutes(offlineMs))}
                <small>min</small>
              </p>
              <p className="green strong small">{percent(offlineMs / totalMs, 1)} del tiempo</p>
            </div>
            <div className="connection-box">
              <p className="connection-label">
                <img src={wifi} alt="" width={16} height={11} />
                En línea
              </p>
              <p className="connection-value">
                {num(minutes(onlineMs))}
                <small>min</small>
              </p>
              <p className="muted strong small">{percent(onlineMs / totalMs, 1)} del tiempo</p>
            </div>
          </div>
          <div className="connection-bar">
            <div className="connection-bar-labels faint small">
              <span>Descargas</span>
              <span>Streaming</span>
            </div>
            <div className="split-bar">
              <span style={{ width: `${(offlineMs / totalMs) * 100}%`, background: 'var(--green)' }} />
              <span style={{ width: `${(onlineMs / totalMs) * 100}%`, background: 'var(--blue)' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="record">
        <div className="record-glow" aria-hidden="true" />
        <div className="record-main">
          <div className="record-icon">
            <img src={plane} alt="" width={28} height={24} />
          </div>
          <div className="record-text">
            <p className="record-eyebrow">
              <span className="record-chip">Récord sin conexión</span>
              <span className="muted small">Tu día con más escucha offline</span>
            </p>
            <h3>{offline.bestDay ? longDate(offline.bestDay.day) : 'Sin escucha sin conexión'}</h3>
            <p className="muted">
              {offline.bestDay
                ? `Ese día escuchaste ${hoursMinutes(offline.bestDay.ms)} de música sin internet, tu mayor marca en este período.`
                : 'En este período no hay reproducciones marcadas como sin conexión.'}
            </p>
          </div>
        </div>
        {offline.bestDay && (
          <div className="record-stats">
            <div>
              <p className="record-stat-label">Duración total</p>
              <p className="record-stat-value green">{hoursMinutes(offline.bestDay.ms)}</p>
              <p className="muted small">en un solo día</p>
            </div>
            <span className="divider" />
            <div>
              <p className="record-stat-label">Canciones</p>
              <p className="record-stat-value">{num(offline.bestDayTracks)}</p>
              <p className="muted small">reproducidas offline</p>
            </div>
          </div>
        )}
      </section>

      <section className="habits-bottom">
        <div className="panel devices">
          <div className="section-head">
            <h2 className="panel-title">
              <img src={devices} alt="" width={18} height={15} />
              Plataformas y dispositivos
            </h2>
            <span className="muted small">Total: {num(minutes(totalMs))} min analizados</span>
          </div>
          <ul className="device-list">
            {platforms.map((p, i) => {
              const info = PLATFORMS[p.name] ?? PLATFORMS.Unknown
              const share = p.ms / totalMs
              return (
                <li key={p.name}>
                  <div className="device-row">
                    <span className="device-icon">
                      <img src={info.icon} alt="" width={18} height={18} />
                    </span>
                    <span className="device-name">
                      <strong>{info.label}</strong>
                      <span className="faint small">{num(p.plays)} reproducciones</span>
                    </span>
                    <span className="device-share">
                      <strong>{percent(share)}</strong>
                      <span className="muted small">{num(minutes(p.ms))} min</span>
                    </span>
                  </div>
                  <div className="bar thick">
                    <span style={{ width: `${share * 100}%`, background: BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)] }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="panel patterns">
          <h2 className="panel-title">
            <img src={insights} alt="" width={20} height={16} />
            Patrones y curiosidades
          </h2>
          <ul className="pattern-list">
            {peak !== null && (
              <Pattern icon={tileMoon} title={listenerType(peak)}>
                Tu hora con más música es a las {peak}:00. El {percent(night)} de tu tiempo fue entre las 10 p. m. y las 6 a.
                m.
              </Pattern>
            )}
            {record && (
              <Pattern icon={tileCalendar} title={`Día récord: ${shortDate(record.day)}`}>
                Ese día escuchaste {hoursMinutes(record.ms)} de música, más que cualquier otro día del período.
              </Pattern>
            )}
            {streak.days > 0 && (
              <Pattern icon={flame} small title={`Racha más larga: ${num(streak.days)} ${streak.days === 1 ? 'día' : 'días'}`}>
                Del {shortDate(streak.from)} al {shortDate(streak.to)} escuchaste música todos los días.
              </Pattern>
            )}
            {fav && (
              <Pattern icon={repeat} small title={`Tu obsesión: ${fav.track}`}>
                {fav.plays} reproducciones de «{fav.track}»{fav.artist && ` de ${fav.artist}`} el {shortDate(fav.day)}.
              </Pattern>
            )}
          </ul>
          <div className="report">
            <button className="report-button soon" disabled>
              <img src={download} alt="" width={13} height={13} />
              Descargar reporte
            </button>
            <p className="faint small">Próximamente</p>
          </div>
        </div>
      </section>

      <footer className="disclaimer">
        <p>
          <img src={shield} alt="" width={13} height={17} />
          Calculado en tu navegador a partir de tus archivos. Solo cuentan como reproducción las escuchas de 30 segundos o más.
        </p>
        <span className="faint small">
          Generado: hoy, {generatedAt}
        </span>
      </footer>
    </main>
  )
}

function Pattern({ icon, title, small, children }: { icon: string; title: string; small?: boolean; children: ReactNode }) {
  return (
    <li className="pattern">
      {small ? (
        <span className="pattern-tile">
          <img src={icon} alt="" width={15} height={15} />
        </span>
      ) : (
        <img src={icon} alt="" width={31} height={39} />
      )}
      <div>
        <p className="pattern-title ellipsis">{title}</p>
        <p className="muted small">{children}</p>
      </div>
    </li>
  )
}
