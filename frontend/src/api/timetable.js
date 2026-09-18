import api from './client';


// ============================================================
// GET MY TIMETABLE
// ============================================================

export const getMyTimetableApi = async () => {
  const response = await api.get(
    '/api/timetable/me'
  );

  return response.data;
};


// ============================================================
// GET FACULTY LIST
// ============================================================

export const getFacultyListApi = async () => {
  const response = await api.get(
    '/api/timetable/faculty-list'
  );

  return response.data;
};


// ============================================================
// CREATE TIMETABLE
// ============================================================

export const createTimetableApi = async (
  payload
) => {
  const response = await api.post(
    '/api/timetable',
    payload
  );

  return response.data;
};


// ============================================================
// UPDATE TIMETABLE
// ============================================================

export const updateTimetableApi = async (
  entryId,
  payload
) => {
  const response = await api.put(
    `/api/timetable/${entryId}`,
    payload
  );

  return response.data;
};


// ============================================================
// DELETE TIMETABLE
// ============================================================

export const deleteTimetableApi = async (
  entryId
) => {
  const response = await api.delete(
    `/api/timetable/${entryId}`
  );

  return response.data;
};