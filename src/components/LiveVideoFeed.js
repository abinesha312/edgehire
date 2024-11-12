import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

function LiveVideoFeed({ question, onResponseSubmitted, onNextQuestion }) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [response, setResponse] = useState('');
  const videoRef = useRef(null);
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: true, audio: true });

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
    startRecording();
  };

  const handleStopAnswering = async () => {
    setIsAnswering(false);
    stopRecording();
    
    try {
      const evaluationResponse = await fetch('/evaluate_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer: response }),
      });
      const evaluationData = await evaluationResponse.json();
      onResponseSubmitted(response, evaluationData);
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }
    
    onNextQuestion();
  };

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
      {mediaBlobUrl && <video src={mediaBlobUrl} controls />}
    </div>
  );
}

export default LiveVideoFeed;