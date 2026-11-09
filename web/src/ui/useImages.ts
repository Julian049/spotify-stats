import { useEffect, useState } from 'react'
import { fetchImages, type ImageKind } from '../services/images'

// Loads the images of these track uris and reloads them when the list changes.
export function useImages(kind: ImageKind, uris: (string | null)[]): Map<string, string> {
  const [images, setImages] = useState(new Map<string, string>())
  // A string, so the effect only runs again when the uris really change, not on every render.
  const key = uris.filter((uri) => uri !== null).join(',')

  useEffect(() => {
    let current = true
    fetchImages(kind, key ? key.split(',') : []).then((found) => {
      if (current) setImages(found) // ignore answers of an older list
    })
    return () => {
      current = false
    }
  }, [kind, key])

  return images
}
