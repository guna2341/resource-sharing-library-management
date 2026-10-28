package com.library.Resource.Sharing.Library.Management.service;


import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityPatchRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.communities.CommunityResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.mapper.CommunityMapper;
import com.library.Resource.Sharing.Library.Management.model.Communities;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityMembersInProjection;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityProjection;
import com.library.Resource.Sharing.Library.Management.repository.CommunityMembersRepository;
import com.library.Resource.Sharing.Library.Management.repository.CommunityRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CommunityService {

    private CommunityRepository communityRepository;
    private CommunityMembersRepository communityMembersRepository;
    private UserRepository userRepository;
    private CommunityMapper communityMapper;

    private CommunityResponse getCommunityResponse(Communities community, User user) {
        UserSummaryResponse userSummaryResponse = UserSummaryResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .profileUrl(user.getProfileUrl())
                .build();
        return CommunityResponse.builder()
                .communityId(community.getCommunityId())
                .name(community.getName())
                .description(community.getDescription())
                .user(userSummaryResponse)
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .build();
    }

    private CommunityResponse getCommunityResponse(Communities community) {
        return CommunityResponse.builder()
                .communityId(community.getCommunityId())
                .name(community.getName())
                .description(community.getDescription())
                .createdAt(community.getCreatedAt())
                .updatedAt(community.getUpdatedAt())
                .build();
    }

    public ApiResponse getCommunities() {
        List<CommunityProjection> communities = communityRepository.findAllCommunities();
        return new ApiResponse(true, "Communities fetched successfully.", communities);
    }

    public ApiResponse getCommunitiesCreatedByUser(Long userId) {
        List<CommunityProjection> communities = communityRepository.findAllByCreatedBy_UserId(userId);
        return new ApiResponse(true, "Communities created by " + userId + " fetched successfully.", communities);
    }

    public ApiResponse getCommunitiesUserIn(Long userId) {
        List<CommunityMembersInProjection> communities = communityMembersRepository.findAllCommunitiesByUserId(userId, CommunitymemberRole.OWNER);
        return new ApiResponse(true, "Communities user in fetched successfully", communities);
    }

    @Transactional
    public ApiResponse postCommunity(CommunityRequest request) {
        User user = userRepository.findById(request.getCreatedBy()).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getCreatedBy()));
        if (communityRepository.existsByName(request.getName())) {
            return new ApiResponse(false, "Community with name already exists");
        }
        Communities community = Communities.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(user)
                .build();
        Communities savedCommunity = communityRepository.save(community);
        CommunityMembers ownerMember = CommunityMembers.builder()
                .communities(savedCommunity)
                .user(user)
                .role(CommunitymemberRole.OWNER)
                .build();
        communityMembersRepository.save(ownerMember);
        CommunityResponse response = getCommunityResponse(savedCommunity, user);
        return new ApiResponse(true, "Community added successfully.", response);
    }

    public ApiResponse patchCommunity(CommunityPatchRequest request, Long communityId) {
        if (!communityRepository.existsById(communityId)) {
            return new ApiResponse(false, "Community with id: " + communityId + " not found.");
        }
        Communities community = communityRepository.findById(communityId).orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + communityId));
        communityMapper.updateCommunity(request, community);
        Communities savedCommunity = communityRepository.save(community);
        CommunityResponse response = getCommunityResponse(savedCommunity);
        return new ApiResponse(true, "Community updated successfully.", response);
    }

    @Transactional
    public ApiResponse deleteCommunity(Long communityId) {
        if (!communityRepository.existsById(communityId)) {
            return new ApiResponse(false, "Community with id: " + communityId + " not found.");
        }
        communityMembersRepository.deleteByCommunities_CommunityId(communityId);
        communityRepository.deleteById(communityId);
        return new ApiResponse(true, "Community with id: " + communityId + " deleted successfully.");
    }


}
