package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityMessageRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityPatchRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.CommunityService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/communities")
@AllArgsConstructor
public class CommunityController {

    private CommunityService communityService;

    @GetMapping
    public ResponseEntity<ApiResponse> getCommunities() {
        ApiResponse response = communityService.getCommunities();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/created/{userId}")
    public ResponseEntity<ApiResponse> getCommunitiesCreatedByUser(@PathVariable Long userId) {
        ApiResponse response = communityService.getCommunitiesCreatedByUser(userId);
        return ResponseEntity.ok(response);

    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse> getCommunitiesUserIn(@PathVariable Long userId) {
        ApiResponse response = communityService.getCommunitiesUserIn(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> postCommunity(@Valid @RequestBody CommunityRequest request) {
        ApiResponse response = communityService.postCommunity(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{communityId}")
    public ResponseEntity<ApiResponse> patchCommunity(CommunityPatchRequest request, @PathVariable Long communityId) {
        ApiResponse response = communityService.patchCommunity(request, communityId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{communityId}")
    public ResponseEntity<ApiResponse> deleteCommunity(@PathVariable Long communityId) {
        ApiResponse response = communityService.deleteCommunity(communityId);
        return ResponseEntity.ok(response);
    }

}
