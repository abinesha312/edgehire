import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './App.css';

function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartInterview = (formData) => {
    navigate('/interview', { state: { formData } });
  };

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="navbar-logo">EdgeHire</div>
        <ul className="navbar-links">
          <li><a href="#about">About</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <header className="hero">
        <h1>Welcome to EdgeHire</h1>
        <p>Revolutionizing the interview process with AI-powered assessments</p>
        <button onClick={() => setIsModalOpen(true)} className="cta-button">Start Your Interview</button>
      </header>

      <section id="about" className="section">
        <h2>About EdgeHire</h2>
        <p>EdgeHire is an innovative AI-driven interview platform that helps job seekers practice and improve their interview skills. Our advanced technology provides personalized feedback and insights to enhance your performance.</p>
      </section>

      <section id="how-it-works" className="section">
        <h2>How It Works</h2>
        <ol className="steps">
          <li>Enter your job details and preferences</li>
          <li>Answer a series of tailored interview questions</li>
          <li>Receive instant AI-generated feedback on your responses</li>
          <li>Review your performance and areas for improvement</li>
        </ol>
      </section>

      <section id="contact" className="section">
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to us at support@edgehire.com</p>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStartInterview}
      />
    </div>
  );
}

export default LandingPage;