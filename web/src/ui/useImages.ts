import { useEffect, useMemo, useState } from 'react'
import { cachedImages, fetchImages, type ImageKind } from '../services/images'

const PRELOAD_TIMEOUT_MS = 8_000

// Waits until the browser has downloaded every image (or it failed), so they appear all at once.
// A slow image does not hold the page longer than PRELOAD_TIMEOUT_MS.
function preload(urls: string[]): Promise<void> {
  const all = Promise.all(
    urls.map((url) => {
      const img = new Image()
      img.src = url
      return img.decode().catch(() => {})
    }),
  ).then(() => {})
  return Promise.race([all, new Promise<void>((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS))])
}

// Loads the images of these track uris and reloads them when the list changes.
// loading is true until the images are fetched and downloaded; uris already loaded before are instant.
export function useImages(kind: ImageKind, uris: (string | null)[]): { images: Map<string, string>; loading: boolean } {
  // A string, so the effect only runs again when the uris really change, not on every render.
  const key = uris.filter((uri) => uri !== null).join(',')
  const cached = useMemo(() => cachedImages(kind, key ? key.split(',') : []), [kind, key])
  const [loaded, setLoaded] = useState<{ key: string; images: Map<string, string> } | null>(null)

  useEffect(() => {
    if (cached) return
    let current = true
    fetchImages(kind, key.split(','))
      .then(async (images) => {
        await preload([...images.values()])
        return images
      })
      .then((images) => {
        if (current) setLoaded({ key: `${kind}|${key}`, images }) // ignore answers of an older list
      })
    return () => {
      current = false
    }
  }, [kind, key, cached])

  const images = cached ?? (loaded?.key === `${kind}|${key}` ? loaded.images : null)
  return { images: images ?? new Map(), loading: images === null }
}
