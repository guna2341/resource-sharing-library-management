package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityMessageRequest;
import com.library.Resource.Sharing.Library.Management.dto.request.messages.MessageRequest;
import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.MessageService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/messages")
@AllArgsConstructor
public class MessagesController {

    private MessageService messageService;


    @MessageMapping("/community/{communityId}/{userId}/{username}")
    public void sendMessage(@DestinationVariable Long communityId, @DestinationVariable Long userId, @DestinationVariable String username, CommunityMessageRequest request) {
        messageService.broadCastMessage(communityId, userId, username, request);
    }


    @GetMapping("/{communityId}")
    public ResponseEntity<ApiResponse> getMessages(@PathVariable Long communityId) {
        ApiResponse response = messageService.getMessages(communityId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{communityId}/{senderId}")
    public ResponseEntity<ApiResponse> addMessage(@PathVariable Long communityId, @PathVariable Long senderId, @Valid @RequestBody MessageRequest messageRequest) {
        ApiResponse response = messageService.postMessage(communityId, senderId, messageRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Long messageId) {
        ApiResponse response = messageService.deleteMessage(messageId);
        return ResponseEntity.ok(response);
    }

}
