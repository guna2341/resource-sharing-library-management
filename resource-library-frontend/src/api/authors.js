import api from './client';

// GET /api/v1/author
// returns: { success, message, data: Author[] }
export const getAuthors = () =>
  api.get('/api/v1/author').then((r) => r.data);

// GET /api/v1/author/{authorId}
export const getAuthorById = (authorId) =>
  api.get(`/api/v1/author/${authorId}`).then((r) => r.data);

// POST /api/v1/author
// body: { name, bio, profileUrl }
export const createAuthor = (data) =>
  api.post('/api/v1/author', data).then((r) => r.data);

// PATCH /api/v1/author/{authorId}
export const updateAuthor = (authorId, data) =>
  api.patch(`/api/v1/author/${authorId}`, data).then((r) => r.data);

// DELETE /api/v1/author/{authorId}
export const deleteAuthor = (authorId) =>
  api.delete(`/api/v1/author/${authorId}`).then((r) => r.data);
