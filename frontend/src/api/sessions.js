import api from './client';

export const startSessionApi = async (timetableEntryId) => {
  const response = await api.post('/api/sessions/start', {
    timetable_entry_id: timetableEntryId,
  });
  return response.data;
};

export const endSessionApi = async (sessionId) => {
  const response = await api.post(`/api/sessions/${sessionId}/end`);
  return response.data;
};

export const getSessionSnapshotApi = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}`);
  return response.data;
};

export const getActiveSessionApi = async () => {
  const response = await api.get('/api/sessions/active');
  return response.data;
};
