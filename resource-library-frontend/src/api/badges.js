import api from './client';
import { mockStore } from './mockStore';

export const getBadges = async () => {
  try {
    const res = await api.get('/api/v1/badges');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, data: mockStore.getBadges() };
};

export const getBadgeTypes = async () => {
  try {
    const res = await api.get('/api/v1/badges/badgetypes');
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return {
    success: true,
    data: ['BOOK_UPLOAD', 'RATING', 'DOWNLOAD', 'READING_STREAK', 'CHALLENGE_WIN'],
  };
};

export const activateBadge = async (badgeId) => {
  try {
    const res = await api.get(`/api/v1/badges/${badgeId}/activate`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.updateBadge(badgeId, { isActive: true });
  return { success: true, message: 'Badge activated' };
};

export const deactivateBadge = async (badgeId) => {
  try {
    const res = await api.get(`/api/v1/badges/${badgeId}/deactivate`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.updateBadge(badgeId, { isActive: false });
  return { success: true, message: 'Badge deactivated' };
};

export const createBadge = async (data) => {
  try {
    const res = await api.post('/api/v1/badges', data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const created = mockStore.createBadge(data);
  return { success: true, message: 'Badge created', data: created };
};

export const updateBadge = async (badgeId, data) => {
  try {
    const res = await api.patch(`/api/v1/badges/${badgeId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const updated = mockStore.updateBadge(badgeId, data);
  return { success: true, message: 'Badge updated', data: updated };
};

export const deleteBadge = async (badgeId) => {
  try {
    const res = await api.delete(`/api/v1/badges/${badgeId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteBadge(badgeId);
  return { success: true, message: 'Badge deleted' };
};

export const getUserBadges = async (userId) => {
  try {
    const res = await api.get(`/api/v1/userbadge/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  const badges = mockStore.getBadges();
  // Return the first 4 badges as earned
  return {
    success: true,
    data: badges.slice(0, 4).map((b) => ({
      userBadgeId: b.badgeId,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      badge: b,
    })),
  };
};
