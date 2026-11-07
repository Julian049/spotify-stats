package com.spotifystats.server.service;

import com.spotifystats.server.client.SpotifyClient;
import com.spotifystats.server.client.SpotifyClient.Image;
import com.spotifystats.server.client.SpotifyClient.Track;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageService {

    static final int MAX_IDS = 50;
    private static final Pattern TRACK_ID = Pattern.compile("[A-Za-z0-9]{22}");
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final SpotifyClient spotify;
    private final Map<String, Track> tracks = new ConcurrentHashMap<>();
    private final Map<String, Optional<String>> artistImages = new ConcurrentHashMap<>();

    public ImageService(SpotifyClient spotify) {
        this.spotify = spotify;
    }

    // Track id -> album cover. Tracks Spotify could not answer for are left out.
    public Map<String, String> albumImages(List<String> trackIds) {
        return collect(trackIds, id -> pick(track(id).album().images()));
    }

    // Track id -> image of the track's first artist.
    public Map<String, String> artistImages(List<String> trackIds) {
        return collect(trackIds, id -> artistImage(track(id).artists().get(0).id()));
    }

    private Map<String, String> collect(List<String> trackIds, Function<String, Optional<String>> find) {
        validate(trackIds);
        Map<String, String> result = new LinkedHashMap<>();
        for (String id : trackIds) {
            try {
                find.apply(id).ifPresent(url -> result.put(id, url));
            } catch (RuntimeException e) {
                log.warn("No image for track {}: {}", id, e.getMessage());
            }
        }
        return result;
    }

    private void validate(List<String> trackIds) {
        if (trackIds == null || trackIds.isEmpty() || trackIds.size() > MAX_IDS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Send between 1 and " + MAX_IDS + " track ids");
        }
        // The id goes into a Spotify URL, so only the expected shape is allowed.
        if (!trackIds.stream().allMatch(id -> id != null && TRACK_ID.matcher(id).matches())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid track id");
        }
    }

    private Track track(String id) {
        return tracks.computeIfAbsent(id, spotify::getTrack);
    }

    private Optional<String> artistImage(String artistId) {
        return artistImages.computeIfAbsent(artistId, id -> pick(spotify.getArtist(id).images()));
    }

    // Spotify lists images from largest to smallest; the second one (about 300 px) is enough for a card.
    private static Optional<String> pick(List<Image> images) {
        if (images == null || images.isEmpty()) return Optional.empty();
        return Optional.of(images.get(Math.min(1, images.size() - 1)).url());
    }
}
