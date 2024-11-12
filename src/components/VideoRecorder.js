// src/components/LiveVideoFeed.js
import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

function LiveVideoFeed({ question, onResponseSubmitted, onNextQuestion }) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [response, setResponse] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => console.error("Error accessing media devices:", error));
    }
  }, []);

  const handleStartAnswering = () => {
    setIsAnswering(true);
    setResponse('');
    // Here you would typically start speech-to-text conversion
  };

  const handleStopAnswering = () => {
    setIsAnswering(false);
    onResponseSubmitted(response);
    onNextQuestion();
  };

  // Simulating speech-to-text conversion
  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  return (
    <div className="live-video-feed">
      <video ref={videoRef} autoPlay muted playsInline className="video-preview" />
      <h3>Current Question:</h3>
      <p>{question}</p>
      {!isAnswering ? (
        <button onClick={handleStartAnswering}>Start Answering</button>
      ) : (
        <>
          <textarea 
            value={response} 
            onChange={handleResponseChange} 
            placeholder="Your response will appear here..."
          />
          <button onClick={handleStopAnswering}>Submit Answer</button>
        </>
      )}
    </div>
  );
}

export default LiveVideoFeed;