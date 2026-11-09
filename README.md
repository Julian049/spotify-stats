# Spotify Stats

Upload your Spotify *Extended Streaming History* JSON files and get a report of your listening stats. Files are read in the browser and never leave your computer.

## Run

```
cd web
npm install
npm run dev
```

Tests: `npm test` (inside `web/`).

## Images (optional)

Album and artist images come from a small Spring Boot server that asks the Spotify Web API. Without it the stats still work, just without images.

Create an app at https://developer.spotify.com/dashboard to get a client id and secret, then:

```
cd server
SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... ./mvnw spring-boot:run
```

It listens on `localhost:8080`; `npm run dev` forwards `/api` to it. If the web runs in WSL and the server on Windows, enable `networkingMode=mirrored` in `.wslconfig` so both share `localhost`.

Tests: `./mvnw test` (inside `server/`).
