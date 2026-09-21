package com.freshco.backend.controller;

import com.freshco.backend.dto.SportRequest;
import com.freshco.backend.dto.SportResponse;
import com.freshco.backend.service.SportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportService sportService;

    @GetMapping
    public List<SportResponse> getAllSports() {
        return sportService.getAllSports();
    }

    @GetMapping("/active")
    public List<SportResponse> getActiveSports() {
        return sportService.getActiveSports();
    }

    @GetMapping("/{id}")
    public SportResponse getSportById(@PathVariable Long id) {
        return sportService.getSportById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SportResponse createSport(
            @Valid @RequestBody SportRequest request
    ) {
        return sportService.createSport(request);
    }

    @PutMapping("/{id}")
    public SportResponse updateSport(
            @PathVariable Long id,
            @Valid @RequestBody SportRequest request
    ) {
        return sportService.updateSport(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSport(@PathVariable Long id) {
        sportService.deleteSport(id);
    }
}