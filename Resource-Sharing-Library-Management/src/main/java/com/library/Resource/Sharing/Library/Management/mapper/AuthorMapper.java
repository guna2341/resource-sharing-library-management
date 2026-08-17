package com.library.Resource.Sharing.Library.Management.mapper;

import com.library.Resource.Sharing.Library.Management.dto.request.author.AuthorRequest;
import com.library.Resource.Sharing.Library.Management.model.Author;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface AuthorMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateAuthorFromRequest(AuthorRequest request, @MappingTarget Author author);

}
