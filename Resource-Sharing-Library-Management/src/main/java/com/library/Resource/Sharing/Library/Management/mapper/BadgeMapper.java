package com.library.Resource.Sharing.Library.Management.mapper;

import com.library.Resource.Sharing.Library.Management.dto.request.badges.BadgeRequest;
import com.library.Resource.Sharing.Library.Management.model.Badges;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface BadgeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBadge(BadgeRequest request, @MappingTarget Badges badges);

}
