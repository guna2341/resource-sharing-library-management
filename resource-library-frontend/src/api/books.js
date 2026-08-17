import api from './client';

// GET /api/v1/books
// returns: { success, message, data: BookResponse[] }
export const getBooks = () =>
  api.get('/api/v1/books').then((r) => r.data);

// GET /api/v1/books/{bookId}
// returns: { success, message, data: BookDetailsResponse }
export const getBookById = (bookId) =>
  api.get(`/api/v1/books/${bookId}`).then((r) => r.data);

// POST /api/v1/books
// body: { title, description, pages, coverUrl, fileUrl, fileType, uploadedBy, author }
export const createBook = (data) =>
  api.post('/api/v1/books', data).then((r) => r.data);

// PATCH /api/v1/books/{bookId}
export const updateBook = (bookId, data) =>
  api.patch(`/api/v1/books/${bookId}`, data).then((r) => r.data);

// DELETE /api/v1/books/{bookId}
export const deleteBook = (bookId) =>
  api.delete(`/api/v1/books/${bookId}`).then((r) => r.data);

// GET /api/v1/books/rootId/{rootId} — get all versions
export const getBookVersions = (rootId) =>
  api.get(`/api/v1/books/rootId/${rootId}`).then((r) => r.data);

// POST /api/v1/books/newVersion/{bookId}
export const createBookVersion = (bookId, data) =>
  api.post(`/api/v1/books/newVersion/${bookId}`, data).then((r) => r.data);

// GET /api/v1/books/activateVersion/{bookId}
export const activateBookVersion = (bookId) =>
  api.get(`/api/v1/books/activateVersion/${bookId}`).then((r) => r.data);
