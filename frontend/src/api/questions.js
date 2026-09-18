import api from './client';

// ============================================================
// Student - Ask Faculty
// ============================================================

export const createQuestionApi = async (payload) => {
  const response = await api.post('/api/questions', payload);
  return response.data;
};


// ============================================================
// Student - Get My Questions
// ============================================================

export const getMyQuestionsApi = async () => {
  const response = await api.get('/api/questions/my');
  return response.data;
};


// ============================================================
// Faculty - Get Questions
// ============================================================

export const getFacultyQuestionsApi = async () => {
  const response = await api.get('/api/questions/faculty');
  return response.data;
};


// ============================================================
// Faculty - Answer Question
// ============================================================

export const answerQuestionApi = async (questionId, answer) => {
  const response = await api.post(
    `/api/questions/${questionId}/answer`,
    {
      answer,
    }
  );

  return response.data;
};