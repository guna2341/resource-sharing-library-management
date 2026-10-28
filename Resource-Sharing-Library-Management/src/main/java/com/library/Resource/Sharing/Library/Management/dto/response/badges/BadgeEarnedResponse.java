package com.library.Resource.Sharing.Library.Management.dto.response.badges;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.library.Resource.Sharing.Library.Management.model.Badges;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@JsonPropertyOrder({
        "isBadgeEarned",
        "badgeId",
        "badgeTitle",
        "badgeDescription",
        "badgeIconUrl",
        "createdAt",
        "updatedAt"
})
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class BadgeEarnedResponse {

    Boolean isBadgeEarned;

    List<Badges> badges;

}
