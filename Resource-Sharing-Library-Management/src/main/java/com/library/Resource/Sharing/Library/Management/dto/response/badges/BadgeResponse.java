package com.library.Resource.Sharing.Library.Management.dto.response.badges;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "badgeId",
        "name",
        "description",
        "iconUrl",
        "points",
        "badgeRequirementType",
        "requirementValue",
        "createdAt",
        "updatedAt"
})
public class BadgeResponse {

    Long badgeId;

    String name;

    String description;

    String iconUrl;

    BadgeRequirementType badgeRequirementType;

    Long points;

    Integer requirementValue;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

}
