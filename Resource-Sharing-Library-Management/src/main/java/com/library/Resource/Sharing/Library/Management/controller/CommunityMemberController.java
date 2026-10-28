package com.library.Resource.Sharing.Library.Management.controller;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.service.CommunitymemberService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/communities/members")
@AllArgsConstructor
public class CommunityMemberController {

    private CommunitymemberService communitymemberService;

    @GetMapping("/{communityId}")
    public ResponseEntity<ApiResponse> getCommunityMembers(@PathVariable Long communityId) {
        ApiResponse response = communitymemberService.getCommunityMembers(communityId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/addmember/{communityId}/{memberId}")
    public ResponseEntity<ApiResponse> addMember(@PathVariable Long communityId, @PathVariable Long memberId) {
        ApiResponse response = communitymemberService.addMember(communityId, memberId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deletemember/{communityMemberId}")
    public ResponseEntity<ApiResponse> deleteMember(@PathVariable Long communityMemberId) {
        ApiResponse response = communitymemberService.deleteMember(communityMemberId);
        return ResponseEntity.ok(response);
    }

}
