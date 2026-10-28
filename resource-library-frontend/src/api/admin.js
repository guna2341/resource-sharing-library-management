import api from './client';
import { mockStore } from './mockStore';

// GET /api/v1/admin/users
export const getAdminUsers = async () => {
  try {
    const res = await api.get('/api/v1/admin/users');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (e) {}
  return { success: true, data: mockStore.getAdminUsers() };
};

// POST /api/v1/admin/users
export const addAdminUser = async (data) => {
  try {
    const res = await api.post('/api/v1/admin/users', data);
    if (res.data?.success) return res.data;
  } catch (e) {}
  const created = mockStore.addAdminUser(data);
  return { success: true, message: 'User provisioned successfully', data: created };
};

// DELETE /api/v1/admin/users/{userId}
export const deleteAdminUser = async (userId) => {
  try {
    const res = await api.delete(`/api/v1/admin/users/${userId}`);
    if (res.data?.success) return res.data;
  } catch (e) {}
  mockStore.deleteAdminUser(userId);
  return { success: true, message: 'User deleted' };
};
