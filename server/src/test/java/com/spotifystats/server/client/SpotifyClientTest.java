package com.spotifystats.server.client;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class SpotifyClientTest {

    @Test
    void failsClearlyWhenCredentialsAreMissing() {
        SpotifyClient client = new SpotifyClient("", "");
        assertThrows(IllegalStateException.class, () -> client.getTrack("6VrBWh90BiwWmwKtvwWFcq"));
    }
}
