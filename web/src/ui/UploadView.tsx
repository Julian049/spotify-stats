import { useRef, useState } from 'react'
import account from '../assets/icons/account.svg'
import arrowDark from '../assets/icons/arrow-right-dark.svg'
import checkGreen from '../assets/icons/check-circle-green.svg'
import check from '../assets/icons/check-circle.svg'
import clock from '../assets/icons/clock.svg'
import close from '../assets/icons/close.svg'
import dropBadge from '../assets/icons/drop-badge.svg'
import dropWaves from '../assets/icons/drop-waves.svg'
import externalLink from '../assets/icons/external-link.svg'
import folderOpen from '../assets/icons/folder-open.svg'
import folder from '../assets/icons/folder.svg'
import jsonFile from '../assets/icons/json-file.svg'
import link from '../assets/icons/link.svg'
import lock from '../assets/icons/lock.svg'
import mail from '../assets/icons/mail.svg'
import playCircle from '../assets/icons/play-circle.svg'
import terminal from '../assets/icons/terminal.svg'
import trash from '../assets/icons/trash.svg'
import type { Play } from '../model/play'
import { totals } from '../services/stats'
import { monthLabel, num } from './format'
import './upload.css'

// plays is null while the file is being read.
export type LoadedFile = { id: number; name: string; size: number; plays: Play[] | null; error: boolean }

type Props = {
  files: LoadedFile[]
  totalPlays: number
  onAdd: (files: FileList) => void
  onRemove: (id: number) => void
  onClear: () => void
  onDemo: () => void
  onAnalyze: () => void
}

const PRIVACY_URL = 'https://www.spotify.com/account/privacy/'

const STEPS = [
  {
    icon: account,
    title: 'Entra a tu cuenta',
    text: 'Inicia sesión en spotify.com desde el navegador y abre la sección de privacidad de tu cuenta.',
    footIcon: link,
    foot: 'Cuenta › Privacidad de la cuenta',
  },
  {
    icon: mail,
    title: 'Solicita tus datos',
    text: 'Marca «Historial de reproducción ampliado», pide los datos y confirma la solicitud desde el correo que te llega.',
    footIcon: clock,
    foot: 'Puede tardar hasta 30 días',
  },
  {
    icon: folder,
    title: 'Descarga y descomprime',
    text: 'Cuando Spotify te avise, descarga el .zip, descomprímelo y sube aquí los archivos Streaming_History_Audio.',
    footIcon: checkGreen,
    foot: '¡Listo para explorar tu música!',
    done: true,
  },
]

export default function UploadView({ files, totalPlays, onAdd, onRemove, onClear, onDemo, onAnalyze }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const reading = files.filter((f) => !f.plays && !f.error).length
  const ready = files.some((f) => f.plays && f.plays.length > 0) && reading === 0

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files)
  }

  return (
    <main className="upload">
      <div className="upload-glow" aria-hidden="true" />
      <div className="upload-glow blue" aria-hidden="true" />

      <section className="upload-intro">
        <span className="upload-chip">
          <span className="dot small" />
          Análisis local y privado
        </span>
        <h1 className="page-title">Importa tus datos de Spotify</h1>
        <p className="lead">
          Sube los archivos de tu historial ampliado y descubre qué, cuándo y cómo escuchas. Todo se calcula en tu
          navegador.
        </p>
        <button className="demo-button" onClick={onDemo}>
          <img src={playCircle} alt="" width={13} height={13} />O prueba con datos de ejemplo
        </button>
      </section>

      <section className="upload-core">
        <div
          className={`dropzone card${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => input.current?.click()}
        >
          <div className="drop-graphic" aria-hidden="true">
            <img src={dropWaves} alt="" width={56} height={56} />
            <img className="drop-badge" src={dropBadge} alt="" width={34} height={45} />
          </div>
          <h2>Arrastra tus archivos JSON aquí o haz clic para buscarlos</h2>
          <p className="muted">
            Formato válido (historial ampliado): <code>Streaming_History_Audio_*.json</code>
          </p>
          <button
            className="pill-button select-button"
            onClick={(e) => {
              e.stopPropagation()
              input.current?.click()
            }}
          >
            <img src={folderOpen} alt="" width={18} height={13} />
            Seleccionar archivos
          </button>
          <p className="hint">Puedes seleccionar varios archivos a la vez.</p>
          <input
            ref={input}
            className="sr-only"
            type="file"
            accept=".json,application/json"
            multiple
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files?.length) onAdd(e.target.files)
              e.target.value = '' // lets the same file be picked again after removing it
            }}
          />
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <div className="file-list-head">
              <div className="file-list-title">
                <span>Archivos listos para analizar</span>
                <span className="badge">
                  {files.length} {files.length === 1 ? 'cargado' : 'cargados'}
                </span>
              </div>
              <button className="clear-button" onClick={onClear}>
                <img src={trash} alt="" width={9} height={11} />
                Limpiar todo
              </button>
            </div>

            {files.map((f) => (
              <FileItem key={f.id} file={f} onRemove={() => onRemove(f.id)} />
            ))}

            <div className="analyze-row">
              <div className="analyze-info">
                {reading > 0 ? <span className="mini-spinner" aria-hidden="true" /> : <span className="dot big" />}
                <div role="status">
                  <p className="analyze-total">{num(totalPlays)} reproducciones en total</p>
                  <p className="muted small">
                    {reading > 0
                      ? `Leyendo archivos… ${files.length - reading} de ${files.length} listos`
                      : ready
                        ? 'Todo listo para armar tu panel de estadísticas.'
                        : 'Ningún archivo válido todavía.'}
                  </p>
                </div>
              </div>
              <button className="analyze-button" onClick={onAnalyze} disabled={!ready}>
                Analizar mis datos
                <img src={arrowDark} alt="" width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        <div className="privacy card">
          <div className="privacy-icon">
            <img src={lock} alt="" width={15} height={19} />
          </div>
          <div>
            <div className="privacy-title">
              <h3>100% privado y seguro</h3>
              <span className="tag">Sin subir archivos</span>
            </div>
            <p className="muted">
              Tus archivos se leen en este navegador y nunca se suben a ningún servidor. Para mostrar portadas y fotos de
              artistas solo se consultan los identificadores de las canciones.
            </p>
          </div>
        </div>
      </section>

      <section className="guide">
        <div className="section-head">
          <div>
            <h2 className="card-title">¿Cómo solicitar tus datos oficiales a Spotify?</h2>
            <p className="muted small">Solo toma 2 minutos hacer la solicitud desde la página de privacidad de tu cuenta.</p>
          </div>
          <a className="portal-link" href={PRIVACY_URL} target="_blank" rel="noreferrer">
            Abrir portal de Spotify
            <img src={externalLink} alt="" width={12} height={12} />
          </a>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step card">
              <div className="step-body">
                <div className="step-top">
                  <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
                  <img src={s.icon} alt="" width={17} height={17} />
                </div>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
              <div className={`step-foot${s.done ? ' done' : ''}`}>
                <img src={s.footIcon} alt="" width={13} height={13} />
                {s.foot}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="upload-footer faint">
        <span>
          <img src={terminal} alt="" width={13} height={11} />
          Compatible con las exportaciones de datos de Spotify
        </span>
        <span>Archivos JSON (UTF-8) • Procesamiento 100% local</span>
      </footer>
    </main>
  )
}

function FileItem({ file, onRemove }: { file: LoadedFile; onRemove: () => void }) {
  const t = file.plays ? totals(file.plays) : null
  const reading = !file.plays && !file.error

  return (
    <div className={`file-item card${file.error ? ' error' : ''}`}>
      <div className="file-row">
        <div className="file-main">
          <div className="file-icon">
            <img src={jsonFile} alt="" width={18} height={15} />
          </div>
          <div className="file-text">
            <div className="file-name">
              <strong className="ellipsis">{file.name}</strong>
              {t && (
                <span className="status ok">
                  <img src={check} alt="" width={12} height={12} />
                  Listo
                </span>
              )}
              {file.error && <span className="status bad">No válido</span>}
            </div>
            <p className="file-meta">
              {file.size > 0 && <span>{(file.size / 1_048_576).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB</span>}
              {t && (
                <>
                  {file.size > 0 && <span className="sep">•</span>}
                  <span>{num(t.plays)} reproducciones</span>
                  {t.from && t.to && (
                    <>
                      <span className="sep">•</span>
                      <span>
                        {monthLabel(t.from.slice(0, 7))} — {monthLabel(t.to.slice(0, 7))}
                      </span>
                    </>
                  )}
                </>
              )}
              {reading && <span>Leyendo…</span>}
              {file.error && <span>No parece un historial de Spotify en JSON.</span>}
            </p>
          </div>
        </div>
        <div className="file-actions">
          {t && <span className="green semibold">100%</span>}
          <button className="remove-button" onClick={onRemove} aria-label={`Quitar ${file.name}`}>
            <img src={close} alt="" width={11} height={11} />
          </button>
        </div>
      </div>
      <div className={`progress${reading ? ' loading' : ''}`}>
        <span />
      </div>
    </div>
  )
}
