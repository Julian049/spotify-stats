package com.spotifystats.server.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.spotifystats.server.client.SpotifyClient;
import com.spotifystats.server.client.SpotifyClient.Album;
import com.spotifystats.server.client.SpotifyClient.Artist;
import com.spotifystats.server.client.SpotifyClient.Image;
import com.spotifystats.server.client.SpotifyClient.Track;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class ImageServiceTest {

    private static final String TRACK = "6VrBWh90BiwWmwKtvwWFcq";
    private static final String OTHER = "6IlcjkEw26SeAKvjXSwsVb";

    private SpotifyClient spotify;
    private ImageService service;

    @BeforeEach
    void setUp() {
        spotify = mock(SpotifyClient.class);
        service = new ImageService(spotify);
        when(spotify.getTrack(TRACK)).thenReturn(new Track(
                new Album(List.of(new Image("big"), new Image("medium"), new Image("small"))),
                List.of(new Artist("artist1", null))));
        when(spotify.getArtist("artist1")).thenReturn(new Artist("artist1", List.of(new Image("a-big"), new Image("a-medium"))));
    }

    @Test
    void returnsTheMediumAlbumCover() {
        assertEquals(Map.of(TRACK, "medium"), service.albumImages(List.of(TRACK)));
    }

    @Test
    void secondRequestForTheSameTrackDoesNotCallSpotify() {
        service.albumImages(List.of(TRACK));
        service.albumImages(List.of(TRACK));
        service.artistImages(List.of(TRACK));
        service.artistImages(List.of(TRACK));

        verify(spotify, times(1)).getTrack(TRACK);
        verify(spotify, times(1)).getArtist("artist1");
    }

    @Test
    void rejectsTooManyIds() {
        List<String> tooMany = java.util.Collections.nCopies(ImageService.MAX_IDS + 1, TRACK);
        assertThrows(ResponseStatusException.class, () -> service.albumImages(tooMany));
    }

    @Test
    void rejectsMalformedIds() {
        assertThrows(ResponseStatusException.class, () -> service.albumImages(List.of("../users/me")));
    }

    @Test
    void leavesOutTracksSpotifyFailsFor() {
        when(spotify.getTrack(OTHER)).thenThrow(new RuntimeException("404"));
        assertEquals(Map.of(TRACK, "medium"), service.albumImages(List.of(OTHER, TRACK)));
        verify(spotify, times(1)).getTrack(OTHER);
        verify(spotify, times(0)).getArtist(anyString());
    }
}
