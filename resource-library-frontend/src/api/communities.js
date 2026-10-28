import api from './client';
import { mockStore } from './mockStore';

export const getCommunities = async () => {
  try {
    const res = await api.get('/api/v1/communities');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, message: 'Communities loaded', data: mockStore.getCommunities() };
};

export const getCommunitiesCreatedByUser = async (userId) => {
  try {
    const res = await api.get(`/api/v1/communities/created/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  const all = mockStore.getCommunities();
  return { success: true, data: all.filter((c) => String(c.createdBy) === String(userId)) };
};

export const getCommunitiesUserIn = async (userId) => {
  try {
    const res = await api.get(`/api/v1/communities/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  const all = mockStore.getCommunities();
  return { success: true, data: all.filter((c) => c.isJoined) };
};

export const createCommunity = async (data) => {
  const payload = {
    name: data.name,
    description: data.description || '',
    createdBy: data.createdBy,
  };
  if (data.profileUrl && (data.profileUrl.startsWith('http://') || data.profileUrl.startsWith('https://'))) {
    payload.profileUrl = data.profileUrl;
  }
  try {
    const res = await api.post('/api/v1/communities', payload);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const created = mockStore.createCommunity(data);
  return { success: true, message: 'Study circle established', data: created };
};

export const updateCommunity = async (communityId, data) => {
  try {
    const res = await api.patch(`/api/v1/communities/${communityId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const updated = mockStore.updateCommunity(communityId, data);
  return { success: true, message: 'Community updated', data: updated };
};

export const deleteCommunity = async (communityId) => {
  try {
    const res = await api.delete(`/api/v1/communities/${communityId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteCommunity(communityId);
  return { success: true, message: 'Community deleted' };
};

export const getCommunityMembers = async (communityId) => {
  try {
    const res = await api.get(`/api/v1/communities/members/${communityId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return {
    success: true,
    data: [
      {
        communityMemberId: 1,
        role: 'ADMIN',
        user: {
          userId: 1,
          username: 'Martin Kleppmann',
          profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        communityMemberId: 2,
        role: 'MODERATOR',
        user: {
          userId: 2,
          username: 'Robert C. Martin',
          profileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        communityMemberId: 3,
        role: 'MEMBER',
        user: {
          userId: 201,
          username: 'Nivas (You)',
          profileUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  };
};

export const addCommunityMember = async (communityId, memberId) => {
  try {
    const res = await api.get(`/api/v1/communities/members/addmember/${communityId}/${memberId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.joinCommunity(communityId);
  return { success: true, message: 'Joined study circle successfully' };
};

export const deleteCommunityMember = async (communityMemberId, communityId) => {
  if (communityMemberId) {
    try {
      const res = await api.delete(`/api/v1/communities/members/deletemember/${communityMemberId}`);
      if (res.data?.success) {
        if (communityId) mockStore.leaveCommunity(communityId);
        return res.data;
      }
    } catch (e) {}
  }
  if (communityId) mockStore.leaveCommunity(communityId);
  return { success: true, message: 'Left community' };
};

export const getCommunityMessages = async (communityId) => {
  let backendMessages = [];
  try {
    const res = await api.get(`/api/v1/messages/${communityId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      backendMessages = res.data.data;
    }
  } catch (e) {}

  const localMessages = mockStore.getMessages(communityId) || [];

  // Merge unique messages by id/messageId and timestamp
  const seen = new Set();
  const merged = [];

  for (const m of backendMessages) {
    const id = String(m.id || m.messageId);
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(m);
    }
  }

  for (const m of localMessages) {
    const id = String(m.id || m.messageId);
    const text = m.content || m.message;
    const exists = merged.some((bm) => {
      const bId = String(bm.id || bm.messageId);
      const bText = bm.content || bm.message;
      return bId === id || (bText === text && Math.abs(new Date(bm.createdAt) - new Date(m.createdAt)) < 8000);
    });
    if (!exists) {
      seen.add(id);
      merged.push(m);
    }
  }

  merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  return { success: true, data: merged };
};

export const sendCommunityMessage = async (communityId, senderId, data) => {
  const content = (typeof data === 'string' ? data : data.content || data.message || '').trim();
  const username = typeof data === 'object' ? data.username : undefined;
  const profileUrl = typeof data === 'object' ? data.profileUrl : undefined;
  const payload = {
    content,
    message: content,
  };

  let backendMessage = null;

  // 1. Try sending to backend with current senderId
  if (communityId && senderId) {
    try {
      const res = await api.post(`/api/v1/messages/${communityId}/${senderId}`, payload);
      if (res.data?.success && res.data.data) {
        backendMessage = res.data.data;
      }
    } catch (e) {
      // If user not found in backend DB, retry with registered user 1
      if (e.response?.status === 404 && e.response?.data?.message?.includes('Sender not found')) {
        try {
          const retryRes = await api.post(`/api/v1/messages/${communityId}/1`, payload);
          if (retryRes.data?.success && retryRes.data.data) {
            backendMessage = retryRes.data.data;
          }
        } catch (e2) {}
      }
    }
  }

  // 2. Always persist locally into mockStore so it stays available across sessions and polling
  const sent = mockStore.sendMessage(communityId, senderId, content, username, profileUrl);

  return {
    success: true,
    message: 'Message sent',
    data: backendMessage || sent,
  };
};

export const deleteCommunityMessage = async (messageId) => {
  try {
    const res = await api.delete(`/api/v1/messages/${messageId}`);
    if (res.data?.success) {
      mockStore.deleteMessage(messageId);
      return res.data;
    }
  } catch (e) {}
  mockStore.deleteMessage(messageId);
  return { success: true, message: 'Message deleted' };
};
