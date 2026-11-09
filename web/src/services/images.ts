export type ImageKind = 'albums' | 'artists'

const PREFIX = 'spotify:track:'
// Same rules as the server: it rejects the whole request if one id is invalid or there are more than 50.
const TRACK_ID = /^[A-Za-z0-9]{22}$/
const MAX_IDS = 50

// Track uri -> image url of its album or first artist.
// If the server is down or fails, those images are just missing: the stats work without them.
export async function fetchImages(kind: ImageKind, uris: (string | null)[]): Promise<Map<string, string>> {
  const ids = [...new Set(uris)]
    .filter((uri): uri is string => uri?.startsWith(PREFIX) ?? false)
    .map((uri) => uri.slice(PREFIX.length))
    .filter((id) => TRACK_ID.test(id))

  const images = new Map<string, string>()
  for (let i = 0; i < ids.length; i += MAX_IDS) {
    try {
      const res = await fetch(`/api/images/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: ids.slice(i, i + MAX_IDS) }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const found: Record<string, string> = await res.json()
      for (const [id, url] of Object.entries(found)) images.set(PREFIX + id, url)
    } catch (e) {
      console.warn(`Could not load ${kind} images:`, e)
    }
  }
  return images
}
