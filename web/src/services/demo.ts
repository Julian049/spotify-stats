import type { Play } from '../model/play'

// Made-up catalog. Its uris are not spotify:track:..., so no images are requested for the demo.
const CATALOG: { artist: string; album: string; tracks: string[] }[] = [
  { artist: 'Luna Norte', album: 'Mareas', tracks: ['Faro', 'Sal', 'Orilla', 'Vela'] },
  { artist: 'Los Satélites', album: 'Órbita baja', tracks: ['Despegue', 'Gravedad cero', 'Cometa'] },
  { artist: 'Valeria Sur', album: 'Ciudad de noche', tracks: ['Neón', 'Último bus', 'Azotea', 'Madrugada'] },
  { artist: 'Kilómetro 9', album: 'Ruta', tracks: ['Peaje', 'Curvas', 'Gasolina'] },
  { artist: 'Coral', album: 'Profundo', tracks: ['Arrecife', 'Burbujas', 'Abismo'] },
  { artist: 'Dúo Pradera', album: 'Campo abierto', tracks: ['Trigo', 'Viento', 'Cosecha'] },
  { artist: 'Malva', album: 'Pétalos', tracks: ['Lila', 'Jardín', 'Rocío', 'Primavera'] },
  { artist: 'Eco Club', album: 'Pista 2', tracks: ['Bajo', 'Strobo', 'Final de fiesta'] },
]
const PLATFORMS = ['Android OS 13 API 33 (demo)', 'Windows 10 (demo)', 'web_player windows 10;chrome', 'Partner android_tv demo']

// Small seeded random generator so the demo is the same on every load.
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32
    return seed / 2 ** 32
  }
}

export function demoPlays(): Play[] {
  const rnd = random(42)
  const plays: Play[] = []
  const start = Date.parse('2023-01-01T00:00:00Z')

  for (let day = 0; day < 730; day++) {
    if (rnd() < 0.08) continue // some days without music
    const sessions = 1 + Math.floor(rnd() * 3)
    for (let s = 0; s < sessions; s++) {
      // Up to three sessions a day, each in its own block of hours (06:00 to 22:00 in Colombia) so they never overlap.
      let t = start + day * 86_400_000 + (11 + s * 6 + Math.floor(rnd() * 5)) * 3_600_000
      const offline = rnd() < 0.15
      const platform = PLATFORMS[Math.floor(rnd() ** 2 * PLATFORMS.length)]
      for (let i = 0, n = 5 + Math.floor(rnd() * 15); i < n; i++) {
        // Squared random: the first artists of the catalog are listened to much more.
        const a = CATALOG[Math.floor(rnd() ** 2 * CATALOG.length)]
        const track = a.tracks[Math.floor(rnd() * a.tracks.length)]
        const skipped = rnd() < 0.2
        const msPlayed = skipped ? Math.floor(rnd() * 30_000) : 120_000 + Math.floor(rnd() * 120_000)
        plays.push({
          ts: new Date(t).toISOString().slice(0, 19) + 'Z',
          msPlayed,
          track,
          artist: a.artist,
          album: a.album,
          uri: `demo:track:${a.artist}:${track}`,
          platform,
          reasonStart: 'trackdone',
          reasonEnd: skipped ? 'fwdbtn' : 'trackdone',
          shuffle: rnd() < 0.5,
          skipped,
          offline,
        })
        t += msPlayed + 2_000
      }
    }
  }
  return plays
}
