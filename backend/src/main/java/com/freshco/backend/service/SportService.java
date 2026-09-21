package com.freshco.backend.service;

import com.freshco.backend.dto.SportRequest;
import com.freshco.backend.dto.SportResponse;
import com.freshco.backend.entity.Sport;
import com.freshco.backend.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SportService {

    private final SportRepository sportRepository;

    @Transactional(readOnly = true)
    public List<SportResponse> getAllSports() {
        return sportRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SportResponse> getActiveSports() {
        return sportRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SportResponse getSportById(Long id) {
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport not found with id: " + id));

        return toResponse(sport);
    }

    public SportResponse createSport(SportRequest request) {

        sportRepository.findByNameIgnoreCase(request.name())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Sport already exists: " + request.name()
                    );
                });

        Sport sport = Sport.builder()
                .name(request.name())
                .description(request.description())
                .icon(request.icon())
                .active(request.active() == null || request.active())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        return toResponse(sportRepository.save(sport));
    }

    public SportResponse updateSport(Long id, SportRequest request) {

        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sport not found with id: " + id));

        sportRepository.findByNameIgnoreCase(request.name())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException(
                                "Sport already exists: " + request.name()
                        );
                    }
                });

        sport.setName(request.name());
        sport.setDescription(request.description());
        sport.setIcon(request.icon());

        if (request.active() != null) {
            sport.setActive(request.active());
        }

        if (request.displayOrder() != null) {
            sport.setDisplayOrder(request.displayOrder());
        }

        return toResponse(sport);
    }

    public void deleteSport(Long id) {

        if (!sportRepository.existsById(id)) {
            throw new RuntimeException("Sport not found with id: " + id);
        }

        sportRepository.deleteById(id);
    }

    private SportResponse toResponse(Sport sport) {
        return new SportResponse(
                sport.getId(),
                sport.getName(),
                sport.getDescription(),
                sport.getIcon(),
                sport.getActive(),
                sport.getDisplayOrder()
        );
    }
}