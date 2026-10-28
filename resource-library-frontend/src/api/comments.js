import api from './client';
import { mockStore } from './mockStore';

export const getAllComments = async (bookId) => {
  try {
    const res = await api.get(`/api/v1/comments/${bookId}`);
    if (res.data?.success && Array.isArray(res.data.data)) return res.data;
  } catch (e) {}
  return { success: true, data: mockStore.getComments(bookId) };
};

export const postComment = async (bookId, userId, data) => {
  try {
    const res = await api.post(`/api/v1/comments/${bookId}/${userId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const posted = mockStore.postComment(bookId, data.comment || data.content, { userId });
  return { success: true, message: 'Comment posted', data: posted };
};

export const deleteComment = async (commentId) => {
  try {
    const res = await api.delete(`/api/v1/comments/${commentId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteComment(commentId);
  return { success: true, message: 'Comment removed' };
};
