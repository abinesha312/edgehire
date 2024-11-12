// src/services/faiss.js
import axios from 'axios';

const API_URL = 'http://your-faiss-api-endpoint.com';

export const searchSimilarQuestions = async (jobDescription, position, seniorityLevel) => {
  try {
    const response = await axios.post(`${API_URL}/search`, {
      jobDescription,
      position,
      seniorityLevel
    });
    return response.data.questions;
  } catch (error) {
    console.error('Error searching similar questions:', error);
    return [];
  }
};