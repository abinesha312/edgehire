import React, { useState, useRef, useEffect } from 'react';

const Demo = () => {
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [url, setUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9,opus' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(processRecording, 300);

      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const processRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);
    setUrl(videoURL);
  };

  const transcribeVideo = async () => {
    if (recordedChunks.length === 0) {
      console.error('No recorded video to transcribe');
      return;
    }

    setIsTranscribing(true);

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recorded_video.webm');

    try {
      const response = await fetch('http://127.0.0.1:5000/transcribe_video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error('Error transcribing video:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div>
      <h2>Video Recording and Transcription Demo</h2>

      <video ref={videoRef} autoPlay muted playsInline style={{ width: '640px', height: '360px', backgroundColor: '#000' }} />

      <div>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        <button onClick={transcribeVideo} disabled={isRecording || isTranscribing || recordedChunks.length === 0}>
          Transcribe Video
        </button>
      </div>

      {url && (
        <div>
          <h3>Recorded Video:</h3>
          <video src={url} controls style={{ width: '640px', height: '360px' }} />
        </div>
      )}

      {isTranscribing && <p>Transcribing video...</p>}

      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default Demo;
