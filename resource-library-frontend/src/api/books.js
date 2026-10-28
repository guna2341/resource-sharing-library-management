import api from './client';
import { mockStore } from './mockStore';

// GET /api/v1/books
export const getBooks = async () => {
  try {
    const res = await api.get('/api/v1/books');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {
    // Backend offline or empty
  }
  return { success: true, message: 'Books loaded', data: mockStore.getBooks() };
};

// GET /api/v1/books/{bookId}
export const getBookById = async (bookId) => {
  try {
    const res = await api.get(`/api/v1/books/${bookId}`);
    if (res.data?.success && res.data.data) {
      return res.data;
    }
  } catch (e) {}
  const book = mockStore.getBookById(bookId);
  return { success: true, message: 'Book loaded', data: book };
};

// POST /api/v1/books
export const createBook = async (data) => {
  try {
    const res = await api.post('/api/v1/books', data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const newBook = mockStore.createBook(data);
  return { success: true, message: 'Resource published successfully', data: newBook };
};

// PATCH /api/v1/books/{bookId}
export const updateBook = async (bookId, data) => {
  try {
    const res = await api.patch(`/api/v1/books/${bookId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const updated = mockStore.updateBook(bookId, data);
  return { success: true, message: 'Updated successfully', data: updated };
};

// DELETE /api/v1/books/{bookId}
export const deleteBook = async (bookId) => {
  try {
    const res = await api.delete(`/api/v1/books/${bookId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteBook(bookId);
  return { success: true, message: 'Resource deleted' };
};

// GET /api/v1/books/rootId/{rootId} — get all versions
export const getBookVersions = async (rootId) => {
  try {
    const res = await api.get(`/api/v1/books/rootId/${rootId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, data: mockStore.getBookVersions(rootId) };
};

// POST /api/v1/books/newVersion/{bookId}
export const createBookVersion = async (bookId, data) => {
  try {
    const res = await api.post(`/api/v1/books/newVersion/${bookId}`, data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const ver = mockStore.createBookVersion(bookId, data);
  return { success: true, message: 'New version published', data: ver };
};

// GET /api/v1/books/activateVersion/{bookId}
export const activateBookVersion = async (bookId) => {
  try {
    const res = await api.get(`/api/v1/books/activateVersion/${bookId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const target = mockStore.activateBookVersion(bookId);
  return { success: true, message: 'Version activated', data: target };
};

// POST /api/v1/books/{bookId}/download/{userId}
export const recordBookDownload = async (bookId, userId) => {
  try {
    const res = await api.post(`/api/v1/books/${bookId}/download/${userId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  return { success: true, message: 'Download tracked' };
};
