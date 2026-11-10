import { afterEach, describe, expect, it, vi } from 'vitest'
import { cachedImages, fetchImages } from '../../src/services/images'

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

  // The cache lives for the whole file, so each test below uses tracks no other test asked for.
  it('returns no images when the server fails, and asks again next time', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await fetchImages('albums', [uri(100)])).toEqual(new Map())
    expect(cachedImages('albums', [uri(100)])).toBeNull()

    const fetch = mockServer()
    expect((await fetchImages('albums', [uri(100)])).size).toBe(1)
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('asks only for tracks it has not seen, also remembering tracks without image', async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ [id(201)]: 'img-201' })) // 202 has no image
    vi.stubGlobal('fetch', fetch)
    await fetchImages('artists', [uri(201), uri(202)])
    expect(cachedImages('artists', [uri(201), uri(202), null])).toEqual(new Map([[uri(201), 'img-201']]))

    await fetchImages('artists', [uri(201), uri(202), uri(203)])
    expect(JSON.parse(fetch.mock.calls[1][1]!.body as string)).toEqual({ tracks: [id(203)] })
    expect(cachedImages('albums', [uri(201)])).toBeNull() // albums and artists are cached apart
  })
})
