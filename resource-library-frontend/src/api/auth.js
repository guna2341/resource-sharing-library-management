import api from './client';

// POST /api/auth/v1/register
// body: { username, email, password }
// returns: { success, message, token }
export const register = (data) =>
  api.post('/api/auth/v1/register', data).then((r) => r.data);

// POST /api/auth/v1/login
// body: { email, password }
// returns: { success, message, token }
export const login = (data) =>
  api.post('/api/auth/v1/login', data).then((r) => r.data);

// GET /api/auth/v1/users/{userId}
// returns: { success, message, data: UserResponse }
export const getUser = (userId) =>
  api.get(`/api/auth/v1/users/${userId}`).then((r) => r.data);

// PATCH /api/auth/v1/users/{userId}
// body: { username, phone, profileUrl }
export const updateUser = (userId, data) =>
  api.patch(`/api/auth/v1/users/${userId}`, data).then((r) => r.data);

// PATCH /api/auth/v1/users/{userId}/password
// body: { password }
export const updatePassword = (userId, password) =>
  api.patch(`/api/auth/v1/users/${userId}/password`, { password }).then((r) => r.data);
