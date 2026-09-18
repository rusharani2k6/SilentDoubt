import api from './client';

export const loginApi = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};
