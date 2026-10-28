package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.projection.userPoints.UserPointsProjection;
import com.library.Resource.Sharing.Library.Management.repository.UserPointsRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserPointsService {

    private UserPointsRepository userPointsRepository;

    public ApiResponse getUserPoints(Long userId) {
        List<UserPointsProjection> userpoints = userPointsRepository.findByUser_UserId(userId);
        return new ApiResponse(true, "User points fetched successfully.", userpoints);
    }

}
