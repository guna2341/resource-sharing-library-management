package com.library.Resource.Sharing.Library.Management.mapper;

import com.library.Resource.Sharing.Library.Management.dto.request.comments.CommentsRequest;
import com.library.Resource.Sharing.Library.Management.model.Comments;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateComment(CommentsRequest request, @MappingTarget Comments comments);

}
