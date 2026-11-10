export type ImageKind = 'albums' | 'artists'

const PREFIX = 'spotify:track:'
// Same rules as the server: it rejects the whole request if one id is invalid or there are more than 50.
const TRACK_ID = /^[A-Za-z0-9]{22}$/
const MAX_IDS = 50

// Answers already received, per kind: track uri -> image url, or null if the server had no image.
// Switching screens or periods then asks only for new tracks.
const cache: Record<ImageKind, Map<string, string | null>> = { albums: new Map(), artists: new Map() }

const askable = (uri: string | null): uri is string => !!uri && uri.startsWith(PREFIX) && TRACK_ID.test(uri.slice(PREFIX.length))

function fromCache(kind: ImageKind, uris: (string | null)[]): Map<string, string> {
  const images = new Map<string, string>()
  for (const uri of uris) {
    const url = uri ? cache[kind].get(uri) : undefined
    if (uri && url) images.set(uri, url)
  }
  return images
}

// The images of these uris if every one of them was already asked, otherwise null.
export function cachedImages(kind: ImageKind, uris: (string | null)[]): Map<string, string> | null {
  return uris.every((uri) => !askable(uri) || cache[kind].has(uri)) ? fromCache(kind, uris) : null
}

// Track uri -> image url of its album or first artist.
// If the server is down or fails, those images are just missing: the stats work without them.
export async function fetchImages(kind: ImageKind, uris: (string | null)[]): Promise<Map<string, string>> {
  const ids = [...new Set(uris)]
    .filter((uri): uri is string => askable(uri) && !cache[kind].has(uri))
    .map((uri) => uri.slice(PREFIX.length))

  for (let i = 0; i < ids.length; i += MAX_IDS) {
    const batch = ids.slice(i, i + MAX_IDS)
    try {
      const res = await fetch(`/api/images/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: batch }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const found: Record<string, string> = await res.json()
      // Only a successful answer is cached, so a failed batch is asked again next time.
      for (const id of batch) cache[kind].set(PREFIX + id, found[id] ?? null)
    } catch (e) {
      console.warn(`Could not load ${kind} images:`, e)
    }
  }
  return fromCache(kind, uris)
}
