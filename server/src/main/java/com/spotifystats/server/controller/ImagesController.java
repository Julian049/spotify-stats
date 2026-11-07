package com.spotifystats.server.controller;

import com.spotifystats.server.service.ImageService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/images")
public class ImagesController {

    public record TracksRequest(List<String> tracks) {}

    private final ImageService images;

    public ImagesController(ImageService images) {
        this.images = images;
    }

    @PostMapping("/albums")
    public Map<String, String> albums(@RequestBody TracksRequest request) {
        return images.albumImages(request.tracks());
    }

    @PostMapping("/artists")
    public Map<String, String> artists(@RequestBody TracksRequest request) {
        return images.artistImages(request.tracks());
    }
}
