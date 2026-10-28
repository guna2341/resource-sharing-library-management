package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityMessageRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityMessageResponse;
import com.library.Resource.Sharing.Library.Management.dto.request.messages.MessageRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.communities.CommunitySummaryResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.messages.MessageResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.users.UserSummaryResponse;
import com.library.Resource.Sharing.Library.Management.exception.ResourceNotFoundException;
import com.library.Resource.Sharing.Library.Management.enums.CommunitymemberRole;
import com.library.Resource.Sharing.Library.Management.model.Communities;
import com.library.Resource.Sharing.Library.Management.model.CommunityMembers;
import com.library.Resource.Sharing.Library.Management.model.CommunityMessages;
import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.projection.messages.MessageProjection;
import com.library.Resource.Sharing.Library.Management.repository.CommunityMembersRepository;
import com.library.Resource.Sharing.Library.Management.repository.CommunityRepository;
import com.library.Resource.Sharing.Library.Management.repository.MessageRepository;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MessageService {

    private MessageRepository messageRepository;
    private CommunityRepository communityRepository;
    private UserRepository userRepository;
    private CommunityMembersRepository communityMembersRepository;
    private SimpMessagingTemplate simpMessagingTemplate;

    private MessageResponse getMessageResponse(CommunityMessages communityMessages) {
        User user = communityMessages.getSenderId();
        UserSummaryResponse userSummaryResponse = UserSummaryResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .profileUrl(user.getProfileUrl())
                .build();
        Communities community = communityMessages.getCommunities();
        CommunitySummaryResponse communitySummaryResponse = CommunitySummaryResponse.builder()
                .communityId(community.getCommunityId())
                .name(community.getName())
                .description(community.getDescription())
                .profileUrl(community.getProfileUrl())
                .build();
        return MessageResponse.builder()
                .id(communityMessages.getMessageId())
                .community(communitySummaryResponse)
                .sender(userSummaryResponse)
                .content(communityMessages.getContent())
                .createdAt(communityMessages.getCreatedAt())
                .build();

    }

    public ApiResponse getMessages(Long communityId) {
        List<MessageProjection> messages = messageRepository.findAllByCommunities_CommunityIdOrderByCreatedAt(communityId);
        return new ApiResponse(true, "Messages fetched successfully.", messages);
    }

    @Transactional
    public ApiResponse postMessage(Long communityId, Long senderId, MessageRequest messageRequest) {
        Communities community = communityRepository.findById(communityId).orElseThrow(() -> new ResourceNotFoundException("Community not found with id: " + communityId));
        User sender = userRepository.findById(senderId).orElseThrow(() -> new ResourceNotFoundException("Sender not found with id: " + senderId));
        if (!communityMembersRepository.existsByCommunities_CommunityIdAndUser_UserId(communityId, senderId)) {
            CommunitymemberRole role = (community.getCreatedBy() != null && community.getCreatedBy().getUserId().equals(senderId))
                    ? CommunitymemberRole.OWNER
                    : CommunitymemberRole.MEMBER;
            CommunityMembers member = CommunityMembers.builder()
                    .communities(community)
                    .user(sender)
                    .role(role)
                    .build();
            communityMembersRepository.save(member);
        }
        CommunityMessages communityMessages = CommunityMessages.builder()
                .senderId(sender)
                .communities(community)
                .content(messageRequest.getContent())
                .build();
        CommunityMessages savedMessage = messageRepository.save(communityMessages);
        MessageResponse response = getMessageResponse(savedMessage);
        return new ApiResponse(true, "Messages added successfully.", response);
    }

    public ApiResponse deleteMessage(Long messageId) {
        CommunityMessages communityMessages = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
        messageRepository.delete(communityMessages);
        return new ApiResponse(true, "Message deleted successfully.");
    }

    public ApiResponse broadCastMessage(Long communityId, Long userId, String userName, CommunityMessageRequest request) {
        CommunityMessageResponse response = CommunityMessageResponse.builder()
                .userId(userId)
                .username(userName)
                .message(request.getMessage())
                .communityId(communityId)
                .build();
        simpMessagingTemplate.convertAndSend("/topic/community/" + communityId, response);
        MessageRequest messageRequest = new MessageRequest();
        messageRequest.setContent(request.getMessage());
        postMessage(communityId, userId, messageRequest);
        return new ApiResponse(true, "Message published successfully.");
    }

}
