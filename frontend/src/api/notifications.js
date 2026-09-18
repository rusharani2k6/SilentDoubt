import api from './client';

export const getMyNotificationsApi = async () => {
  const response = await api.get('/api/notifications/me');
  return response.data;
};

export const markNotificationReadApi = async (notificationId) => {
  const response = await api.patch(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await api.post('/api/notifications/read-all');
  return response.data;
};
