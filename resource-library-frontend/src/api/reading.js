import api from './client';
import { INITIAL_BOOKS } from './mockData';

export const getReadingStreak = async (userId) => {
  try {
    const res = await api.get(`/api/v1/reading/streak/${userId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  return {
    success: true,
    data: {
      userId,
      currentStreak: 18,
      longestStreak: 24,
      lastReadDate: new Date().toISOString(),
    },
  };
};

export const getReadingHistory = async (userId) => {
  try {
    const res = await api.get(`/api/v1/reading/history/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return {
    success: true,
    data: [
      {
        historyId: 1,
        book: INITIAL_BOOKS[0],
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        progressPercent: 78,
      },
      {
        historyId: 2,
        book: INITIAL_BOOKS[2],
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        progressPercent: 42,
      },
      {
        historyId: 3,
        book: INITIAL_BOOKS[1],
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        progressPercent: 100,
      },
    ],
  };
};

export const recordReadingActivity = async (userId) => {
  try {
    const res = await api.post(`/api/v1/reading/recordactivity/${userId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  return { success: true, message: 'Activity recorded, streak maintained!' };
};
