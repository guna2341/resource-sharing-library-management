package com.library.Resource.Sharing.Library.Management.repository;

import com.library.Resource.Sharing.Library.Management.model.CommunityMessages;
import com.library.Resource.Sharing.Library.Management.projection.messages.MessageProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<CommunityMessages, Long> {

    List<MessageProjection> findAllByCommunities_CommunityIdOrderByCreatedAt(Long communityId);

}
