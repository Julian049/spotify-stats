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

## Docker

One image runs everything: Spring Boot serves the web app and the `/api` endpoints from the same address.

```
docker build -t spotify-stats .
docker run -p 8080:8080 --env-file server/.env spotify-stats
```

Then open http://localhost:8080. `server/.env` holds `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`; it is never copied into the image.

## Deploy on Render

1. New → **Web Service** → connect this repository. Render detects the `Dockerfile` at the root.
2. Add the environment variables `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
3. Deploy. Render sets `PORT` and the server listens on it.

On the free plan the service sleeps after 15 minutes without visits, so the first visit after that takes about a minute.
