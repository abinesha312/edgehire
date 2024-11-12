// src/services/llama.js
import axios from 'axios';

const API_URL = 'http://your-llama-api-endpoint.com'; // Replace with your actual API endpoint

export const generateQuestions = async (jobDescription, position, seniorityLevel) => {
  try {
    const response = await axios.post(`${API_URL}/generate-questions`, {
      jobDescription,
      position,
      seniorityLevel
    });
    return response.data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
};

export const evaluateResponse = async (question, response) => {
  try {
    const result = await axios.post(`${API_URL}/evaluate-response`, {
      question,
      response
    });
    return result.data;
  } catch (error) {
    console.error('Error evaluating response:', error);
    return null;
  }
};