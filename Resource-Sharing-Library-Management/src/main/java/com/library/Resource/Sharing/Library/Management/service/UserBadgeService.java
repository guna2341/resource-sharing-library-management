package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.projection.userBadges.UserBadgeProjection;
import com.library.Resource.Sharing.Library.Management.repository.UserBadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private UserBadgeRepository userBadgeRepository;

    public ApiResponse getUserBadges(Long userId) {
        List<UserBadgeProjection> userBadges = userBadgeRepository.findByUser_UserId(userId);
        return new ApiResponse(true, "User badge fetched successfully.", userBadges);
    }

}
