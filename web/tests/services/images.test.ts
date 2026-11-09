import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchImages } from '../../src/services/images'

const id = (n: number) => String(n).padStart(22, 'a')
const uri = (n: number) => `spotify:track:${id(n)}`

// Fake server: answers every requested id with a url built from it.
function mockServer() {
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const { tracks } = JSON.parse(init.body as string) as { tracks: string[] }
    return Response.json(Object.fromEntries(tracks.map((t) => [t, `img-${t}`])))
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => vi.unstubAllGlobals())

describe('fetchImages', () => {
  it('sends bare ids once each and returns urls keyed by uri', async () => {
    const fetch = mockServer()
    const images = await fetchImages('albums', [uri(1), uri(1), null, 'spotify:episode:x', 'spotify:track:short'])

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch.mock.calls[0][0]).toBe('/api/images/albums')
    expect(JSON.parse(fetch.mock.calls[0][1].body as string)).toEqual({ tracks: [id(1)] })
    expect(images).toEqual(new Map([[uri(1), `img-${id(1)}`]]))
  })

  it('splits more than 50 ids into several requests', async () => {
    const fetch = mockServer()
    const images = await fetchImages('artists', Array.from({ length: 60 }, (_, i) => uri(i)))

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(images.size).toBe(60)
  })

  it('does not call the server when there is nothing valid to ask', async () => {
    const fetch = mockServer()
    expect(await fetchImages('albums', [null])).toEqual(new Map())
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns no images when the server fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await fetchImages('albums', [uri(1)])).toEqual(new Map())
  })
})
