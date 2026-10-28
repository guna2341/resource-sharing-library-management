package com.library.Resource.Sharing.Library.Management.mapper;

import com.library.Resource.Sharing.Library.Management.dto.request.communities.CommunityPatchRequest;
import com.library.Resource.Sharing.Library.Management.model.Communities;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CommunityMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCommunity(CommunityPatchRequest request, @MappingTarget Communities communities);

}
