import { useState } from 'react'
import './artwork.css'

type Props = { src?: string; name: string; className?: string }

// Album cover or artist picture. object-fit: cover crops every image to the same centered square,
// and without an image (or if it fails) it shows the initial of the name instead.
export default function Artwork({ src, name, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const show = src && !failed

  return (
    <div className={`artwork ${className}`}>
      {show ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{name.trim().charAt(0).toUpperCase() || '♪'}</span>
      )}
    </div>
  )
}
