package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.badges.BadgeRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeResponse;
import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.BadgeMapper;
import com.library.Resource.Sharing.Library.Management.model.Badges;
import com.library.Resource.Sharing.Library.Management.repository.BadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;


@Service
@AllArgsConstructor
public class BadgeService {

    private BadgeRepository badgeRepository;
    private BadgeMapper badgeMapper;

    private BadgeResponse getBadgeResponse(Badges badges) {
        return BadgeResponse.builder()
                .badgeId(badges.getBadgeId())
                .name(badges.getName())
                .description(badges.getDescription())
                .iconUrl(badges.getIconUrl())
                .badgeRequirementType(badges.getRequirementType())
                .requirementValue(badges.getRequirementValue())
                .createdAt(badges.getCreatedAt())
                .updatedAt(badges.getUpdatedAt())
                .build();
    }

    public ApiResponse getBadgeTypes() {
        return new ApiResponse(true, "BadgeTypes fetched succesfully.", Arrays.asList(BadgeRequirementType.values()));
    }

    public ApiResponse getAllBadges() {
        List<Badges> badges = badgeRepository.findAll();
        return new ApiResponse(true, "Badges fetched successfully.", badges);
    }

    public ApiResponse activateBadge(Long badgeId) {
        Badges badges = badgeRepository.findById(badgeId).orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        badges.setActive(true);
        badgeRepository.save(badges);
        return new ApiResponse(true, "Badge with id: " + badgeId + " activated.");
    }

    public ApiResponse deactivateBadge(Long badgeId) {
        Badges badges = badgeRepository.findById(badgeId).orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        badges.setActive(false);
        badgeRepository.save(badges);
        return new ApiResponse(true, "Badge with id: " + badgeId + " deactivated.");
    }

    public ApiResponse postBadge(BadgeRequest badgeRequest) {
        Badges badges = Badges.builder()
                .name(badgeRequest.getName())
                .description(badgeRequest.getDescription())
                .iconUrl(badgeRequest.getIconUrl())
                .requirementType(badgeRequest.getRequirementType())
                .requirementValue(badgeRequest.getRequirementValue())
                .points(badgeRequest.getPoints())
                .build();
        Badges savedBadge = badgeRepository.save(badges);
        BadgeResponse response = getBadgeResponse(savedBadge);
        return new ApiResponse(true, "Badge added successfully.", response);
    }

    public ApiResponse patchBadge(Long badgeId, BadgeRequest request) {
        Badges badges = badgeRepository.findById(badgeId).orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        badgeMapper.updateBadge(request, badges);
        Badges savedBadge = badgeRepository.save(badges);
        BadgeResponse response = getBadgeResponse(savedBadge);
        return new ApiResponse(true, "Badge updated successfully.", response);
    }

    public ApiResponse deleteBadge(Long badgeId) {
        Badges badges = badgeRepository.findById(badgeId).orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + badgeId));
        badgeRepository.delete(badges);
        return new ApiResponse(true, "Badge deleted succssfully.");
    }

}
