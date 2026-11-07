package com.spotifystats.server.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Talks to the Spotify Web API using the client credentials flow.
@Component
public class SpotifyClient {

    public record Image(String url) {}
    public record Album(List<Image> images) {}
    public record Artist(String id, List<Image> images) {}
    public record Track(Album album, List<Artist> artists) {}

    private record Token(@JsonProperty("access_token") String accessToken,
                         @JsonProperty("expires_in") long expiresIn) {}

    private static final String TOKEN_URL = "https://accounts.spotify.com/api/token";
    private static final String API_URL = "https://api.spotify.com/v1";

    private final RestClient http = RestClient.create();
    private final String clientId;
    private final String clientSecret;

    private String token;
    private Instant tokenExpiresAt = Instant.EPOCH;

    public SpotifyClient(@Value("${spotify.client-id}") String clientId,
                         @Value("${spotify.client-secret}") String clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public Track getTrack(String id) {
        return get("/tracks/{id}", id, Track.class);
    }

    public Artist getArtist(String id) {
        return get("/artists/{id}", id, Artist.class);
    }

    private <T> T get(String path, String id, Class<T> type) {
        return http.get()
                .uri(API_URL + path, id)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken())
                .retrieve()
                .body(type);
    }

    // The token lasts an hour; it is reused until a minute before it expires.
    private synchronized String accessToken() {
        if (Instant.now().isAfter(tokenExpiresAt.minusSeconds(60))) {
            if (clientId.isBlank() || clientSecret.isBlank()) {
                throw new IllegalStateException("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set");
            }
            Token fresh = http.post()
                    .uri(TOKEN_URL)
                    .headers(h -> h.setBasicAuth(clientId, clientSecret))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body("grant_type=client_credentials")
                    .retrieve()
                    .body(Token.class);
            token = fresh.accessToken();
            tokenExpiresAt = Instant.now().plusSeconds(fresh.expiresIn());
        }
        return token;
    }
}
