import React, { useState } from 'react';
import Modal from './Modal';
import '../App.css';

function InterviewSetup({ onQuestionsGenerated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setTopic] = useState('');

  const handleTopicSubmit = async (formData) => {
    setTopic(formData.position);
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: formData.position }),
      });
      const data = await response.json();
      onQuestionsGenerated(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Start Interview</button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTopicSubmit}
      />
    </div>
  );
}

export default InterviewSetup;