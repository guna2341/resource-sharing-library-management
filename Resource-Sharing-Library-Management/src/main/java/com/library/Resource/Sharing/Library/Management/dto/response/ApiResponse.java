package com.library.Resource.Sharing.Library.Management.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.dto.response.badges.BadgeEarnedResponse;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(force = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "success",
        "message",
        "data",
        "badgeEarnedResponse",
        "field",
        "requiredFields"
})
public class ApiResponse {

    private final Boolean success;
    private final String message;
    private final Object data;
    private final String field;
    private final Object requiredFields;
    private final BadgeEarnedResponse badges;

    public ApiResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
        this.field = null;
        this.requiredFields = null;
        this.badges = null;
    }

    public ApiResponse(Boolean success, String message, Object data, BadgeEarnedResponse badgeEarnedResponse) {
        this.success = success;
        this.message = message;
        this.badges = badgeEarnedResponse;
        this.data = data;
        this.field = null;
        this.requiredFields = null;
    }

    public ApiResponse(Boolean success, String message, BadgeEarnedResponse badgeEarnedResponse) {
        this.success = success;
        this.message = message;
        this.badges = badgeEarnedResponse;
        this.data = null;
        this.field = null;
        this.requiredFields = null;
    }

    public ApiResponse(Boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.badges = null;
        this.field = null;
        this.requiredFields = null;
    }

    public ApiResponse(Boolean success, String message, String field, Object requiredFields) {
        this.success = success;
        this.message = message;
        this.badges = null;
        this.data = null;
        this.field = field;
        this.requiredFields = requiredFields;
    }



}