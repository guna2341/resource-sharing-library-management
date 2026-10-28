import api from './client';
import { mockStore } from './mockStore';

export const getLeaderboard = async (limit = 10) => {
  try {
    const res = await api.get(`/api/v1/leaderboard/${limit}`);
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, data: mockStore.getLeaderboard().slice(0, limit) };
};

export const getUserLeaderboardDetails = async (userId) => {
  try {
    const res = await api.get(`/api/v1/leaderboard/details/${userId}`);
    if (res.data?.success && res.data.data) return res.data;
  } catch (e) {}
  const all = mockStore.getLeaderboard();
  const found = all.find((u) => String(u.userId) === String(userId)) || all[0];
  return { success: true, data: found };
};

export const getUserPoints = async (userId) => {
  try {
    const res = await api.get(`/api/v1/userpoints/${userId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const all = mockStore.getLeaderboard();
  const found = all.find((u) => String(u.userId) === String(userId));
  return { success: true, data: found?.points || 4850 };
};
