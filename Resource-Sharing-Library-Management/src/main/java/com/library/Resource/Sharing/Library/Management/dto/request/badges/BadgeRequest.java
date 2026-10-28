package com.library.Resource.Sharing.Library.Management.dto.request.badges;

import com.library.Resource.Sharing.Library.Management.enums.BadgeRequirementType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class BadgeRequest {

    @NotBlank(message = "Badge name is required.")
    private String name;

    private String description;

    @URL(message = "IconUrl is invalid")
    @NotBlank(message = "IconUrl is required")
    private String iconUrl;

    @NotNull
    @Min(value = 1, message = "Points must be greater than zero")
    private Long points;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Badge type is required")
    private BadgeRequirementType requirementType;

    @NotNull(message = "Requirement value is required")
    private Integer requirementValue;

}
