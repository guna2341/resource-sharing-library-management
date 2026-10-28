import api from './client';
import { mockStore } from './mockStore';

export const getWishlist = async (userId) => {
  try {
    const res = await api.get(`/api/v1/wishlist/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return { success: true, data: mockStore.getWishlist(userId) };
};

export const addToWishlist = async (userId, bookId) => {
  try {
    const res = await api.get(`/api/v1/wishlist/${userId}/${bookId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const list = mockStore.addToWishlist(userId, bookId);
  return { success: true, message: 'Added to wishlist', data: list };
};

export const removeFromWishlist = async (wishlistId) => {
  try {
    const res = await api.delete(`/api/v1/wishlist/${wishlistId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.removeFromWishlist(wishlistId);
  return { success: true, message: 'Removed from wishlist' };
};
