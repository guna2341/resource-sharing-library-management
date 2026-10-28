import api from './client';
import { mockStore } from './mockStore';

export const getRatings = async (bookId) => {
  try {
    const res = await api.get(`/api/v1/rating/${bookId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return { success: true, data: mockStore.getRatings(bookId) };
};

export const getUserRating = async (bookId, userId) => {
  try {
    const res = await api.get(`/api/v1/rating/${userId}/${bookId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const ratings = mockStore.getRatings(bookId);
  const found = ratings.find((r) => String(r.userId) === String(userId));
  return { success: true, data: found || null };
};

export const postRating = async (bookId, userId, data) => {
  try {
    const res = await api.post(`/api/v1/rating/${bookId}/${userId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const newR = mockStore.postRating(bookId, userId, data);
  return { success: true, message: 'Rating recorded', data: newR };
};

export const updateRating = async (ratingId, data) => {
  try {
    const res = await api.patch(`/api/v1/rating/${ratingId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  return { success: true, message: 'Rating updated' };
};

export const deleteRating = async (bookId) => {
  try {
    const res = await api.delete(`/api/v1/rating/${bookId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  return { success: true, message: 'Rating removed' };
};
