package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.communities.CommunityMemberResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.communities.CommunityResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.model.Communities;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.communities.CommunityMembersProjection;
import com.library.Resource.Sharing.Library.Management.repository.CommunityMembersRepository;
import com.library.Resource.Sharing.Library.Management.repository.CommunityRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CommunitymemberService {

    private CommunityRepository communityRepository;
    private CommunityMembersRepository communityMembersRepository;
    private UserRepository userRepository;

    private CommunityMemberResponse getMemberResponse(CommunityMembers member) {
        User user = member.getUser();
        UserSummaryResponse userResponse = UserSummaryResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .profileUrl(user.getProfileUrl())
                .build();
        Communities communities = member.getCommunities();
        CommunityResponse communityResponse = CommunityResponse.builder()
                .communityId(communities.getCommunityId())
                .name(communities.getName())
                .description(communities.getDescription())
                .profileUrl(communities.getProfileUrl())
                .user(userResponse)
                .build();

        return CommunityMemberResponse.builder()
                .communityMemberId(member.getCommunityMemberId())
                .communities(communityResponse)
                .joinedAt(member.getJoinedAt())
                .role(member.getRole())
                .build();
    }

    public ApiResponse getCommunityMembers(Long communityId) {

        List<CommunityMembersProjection> communityMembers = communityMembersRepository.findAllCommunitiesByCommunities_CommunityId(communityId);

        return new ApiResponse(true, "Community members fetched successfully.", communityMembers);
    }

    @Transactional
    public ApiResponse addMember(Long communityId, Long memberId) {
        User user = userRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + memberId));
        Communities communities = communityRepository.findById(communityId).orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + communityId));
        if(communityMembersRepository.existsByCommunities_CommunityIdAndUser_UserId(communityId, memberId)) {
            return new ApiResponse(false, "Member is already in the community");
        }
        CommunityMembers communityMembers = CommunityMembers.builder()
                .communities(communities)
                .user(user)
                .role(CommunitymemberRole.MEMBER)
                .build();
        CommunityMembers savedMember = communityMembersRepository.save(communityMembers);
        CommunityMemberResponse response = getMemberResponse(savedMember);
        return new ApiResponse(true, "Member with id: " + memberId + " added to community with id: " + communityId + " successfully.", response);
    }

    @Transactional
    public ApiResponse deleteMember(Long communityMemberId) {
        communityMembersRepository.deleteById(communityMemberId);
        return new ApiResponse(true, "Member deleted with id: " + communityMemberId + " successfully.");
    }

}
