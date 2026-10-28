package com.library.Resource.Sharing.Library.Management.mapper;

import com.library.Resource.Sharing.Library.Management.dto.request.ratings.RatingRequest;
import com.library.Resource.Sharing.Library.Management.model.Ratings;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.beans.BeanProperty;

@Mapper(componentModel = "spring")
public interface RatingMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateRating(RatingRequest request, @MappingTarget Ratings ratings);

}
