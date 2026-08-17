import api from './client';

// POST /api/v1/upload  (multipart/form-data, field name: "file")
// Returns: { success, message, data: url }
// Images → public URL, Documents → file key (used for presigned URL by backend)
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
