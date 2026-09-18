import api from './client';

// ============================================================
// LIST USERS
// ============================================================

export const listUsersApi = async (role = null) => {
  const params = role ? { role } : {};

  const response = await api.get('/api/admin/users', {
    params,
  });

  return response.data;
};

// ============================================================
// CREATE SINGLE USER
// ============================================================

export const createUserApi = async (userData) => {
  const response = await api.post(
    '/api/admin/users',
    userData
  );

  return response.data;
};

// ============================================================
// UPDATE USER
// ============================================================

export const updateUserApi = async (userId, userData) => {
  const response = await api.put(
    `/api/admin/users/${userId}`,
    userData
  );

  return response.data;
};

// ============================================================
// DEACTIVATE / DELETE USER
// ============================================================

export const deactivateUserApi = async (
  userId,
  hardDelete = false
) => {
  const response = await api.delete(
    `/api/admin/users/${userId}`,
    {
      params: {
        hard_delete: hardDelete,
      },
    }
  );

  return response.data;
};

// ============================================================
// BULK CSV UPLOAD
// ============================================================

export const bulkUploadUsersApi = async (
  file,
  role,
  section = null
) => {
  const formData = new FormData();

  formData.append('file', file);

  const params = {
    role,
  };

  if (section) {
    params.section = section;
  }

  const response = await api.post(
    '/api/admin/users/bulk-upload',
    formData,
    {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const getConductedClassesApi = async (params) => {
  const response = await api.get('/api/admin/doubt-monitor/classes', { params });
  return response.data;
};

export const getClassDoubtsApi = async (sessionId) => {
  const response = await api.get(`/api/admin/doubt-monitor/classes/${sessionId}/doubts`);
  return response.data;
};

export const getDoubtIdentityApi = async (doubtId) => {
  const response = await api.get(`/api/admin/doubt-monitor/doubts/${doubtId}/identity`);
  return response.data;
};

export const updateDoubtModerationApi = async (doubtId, data) => {
  const response = await api.patch(`/api/admin/doubt-monitor/doubts/${doubtId}`, data);
  return response.data;
};
