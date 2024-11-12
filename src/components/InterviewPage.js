import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionBank from './QuestionBank';
import LiveVideoFeed from './LiveVideoFeed';
import Review from './Review';
import { generateQuestions, evaluateResponse } from '../services/llama';
import { searchSimilarQuestions } from '../services/faiss';
import '../App'; 


function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [review, setReview] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};

  useEffect(() => {
    const fetchQuestions = async () => {
      if (formData) {
        const { jobDescription, position, seniorityLevel } = formData;
        const generatedQuestions = await generateQuestions(jobDescription, position, seniorityLevel);
        const similarQuestions = await searchSimilarQuestions(jobDescription, position, seniorityLevel);
        setQuestions([...generatedQuestions, ...similarQuestions].slice(0, 50));
      }
    };
    fetchQuestions();
  }, [formData]);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setReview(null);
  };

  const handleResponseSubmitted = async (response) => {
    const currentQuestion = questions[currentQuestionIndex];
    const evaluationResult = await evaluateResponse(currentQuestion, response);
    setReview(evaluationResult);
  };

  const handleEndInterview = () => {
    navigate('/results');
  };

  // Check if there are questions available
  const hasQuestions = questions.length > 0;

  return (
    <div className="interview-page">
      <header className="interview-header">
        <h1>EdgeHire Interview</h1>
        <p>Position: {formData?.position || 'Not specified'}</p>
      </header>

      <main className="interview-content">
        <div className="question-bank">
          <QuestionBank 
            questions={questions} 
            currentQuestionIndex={currentQuestionIndex} 
          />
        </div>
        <div className="interview-main">
          {hasQuestions ? (
            <>
              <div className="live-video-feed">
                <LiveVideoFeed 
                  question={questions[currentQuestionIndex]}
                  onResponseSubmitted={handleResponseSubmitted}
                  onNextQuestion={handleNextQuestion}
                />
              </div>
              <div className="review">
                <Review review={review} />
              </div>
            </>
          ) : (
            <p>Loading questions...</p>
          )}
        </div>
      </main>

      <footer className="interview-footer">
        <button onClick={handleEndInterview} className="end-interview-btn">End Interview</button>
        {hasQuestions && (
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
        )}
      </footer>
    </div>
  );
}

export default InterviewPage;