import api from './client';
import { mockStore } from './mockStore';

export const getAuthors = async () => {
  try {
    const res = await api.get('/api/v1/authors');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, message: 'Authors fetched', data: mockStore.getAuthors() };
};

export const getAuthorById = async (authorId) => {
  try {
    const res = await api.get(`/api/v1/authors/${authorId}`);
    if (res.data?.success && res.data.data) return res.data;
  } catch (e) {}
  return { success: true, data: mockStore.getAuthorById(authorId) };
};

export const createAuthor = async (data) => {
  try {
    const res = await api.post('/api/v1/authors', data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const created = mockStore.createAuthor(data);
  return { success: true, message: 'Author registered', data: created };
};

export const updateAuthor = async (authorId, data) => {
  try {
    const res = await api.patch(`/api/v1/authors/${authorId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const updated = mockStore.updateAuthor(authorId, data);
  return { success: true, message: 'Author updated', data: updated };
};

export const deleteAuthor = async (authorId) => {
  try {
    const res = await api.delete(`/api/v1/authors/${authorId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteAuthor(authorId);
  return { success: true, message: 'Author removed' };
};
