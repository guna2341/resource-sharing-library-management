import api from './client';

// GET api/v1/comments
// Returns ALL comments. No per-book filter endpoint exists.
// Client-side filter by bookId is applied in the UI.
export const getAllComments = () =>
  api.get('/api/v1/comments').then((r) => r.data);

// POST api/v1/comments/{bookId}/{userId}
// Note: Backend has a bug with @RequestParam vs path var, sending as path params
// body: { content }
export const postComment = (bookId, userId, data) =>
  api.post(`/api/v1/comments/${bookId}/${userId}`, data).then((r) => r.data);

// PATCH api/v1/comments/{commentId}/{userId}
export const updateComment = (commentId, userId, data) =>
  api.patch(`/api/v1/comments/${commentId}/${userId}`, data).then((r) => r.data);

// DELETE api/v1/comments/{commentId}
export const deleteComment = (commentId) =>
  api.delete(`/api/v1/comments/${commentId}`).then((r) => r.data);
