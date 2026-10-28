import api from './client';
import { mockStore } from './mockStore';

export const getBookmarksByBookId = async (userId, bookId) => {
  try {
    const res = await api.get(`/api/v1/bookmarks/${userId}/${bookId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return { success: true, data: mockStore.getBookmarks(userId, bookId) };
};

export const addBookmark = async (userId, bookId, data) => {
  try {
    const res = await api.post(`/api/v1/bookmarks/${userId}/${bookId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const bm = mockStore.addBookmark(userId, bookId, data.page || data);
  return { success: true, message: 'Bookmark saved', data: bm };
};

export const removeBookmark = async (bookmarkId) => {
  try {
    const res = await api.delete(`/api/v1/bookmarks/${bookmarkId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.removeBookmark(bookmarkId);
  return { success: true, message: 'Bookmark removed' };
};
