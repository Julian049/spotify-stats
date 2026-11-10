import './loader.css'

// Covers the page (not the header) while a screen computes its stats and downloads its images.
export default function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <p className="loader-title">Cargando tus estadísticas…</p>
      <p className="muted small">Preparando gráficas e imágenes</p>
    </div>
  )
}
