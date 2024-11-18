import React, { useRef, useState, useEffect } from 'react';

const ModalRecording = ({ onClose, onSend }) => {
  const videoLiveRef = useRef(null);
  const videoRtaRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [status, setStatus] = useState('init');
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoLiveRef.current) {
          videoLiveRef.current.srcObject = mediaStream;
        }
        const mimeType = getSupportedMimeTypes();
        if (!mimeType) {
          console.error('No supported mime types');
          return;
        }
        const recorder = new MediaRecorder(mediaStream, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((chunks) => [...chunks, event.data]);
          }
        };
        setMediaRecorder(recorder);
        setStatus('streaming');
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getSupportedMimeTypes = () => {
    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=av01,opus'
    ];
    return possibleTypes.find(mimeType => MediaRecorder.isTypeSupported(mimeType)) || null;
  };

  const startRecording = () => {
    setStatus('recording');
    setRecordedChunks([]);
    mediaRecorder.start();
    const intervalId = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  };

  const stopRecording = () => {
    setStatus('processing');
    mediaRecorder.stop();
    setTimeout(previewVideo, 100);
  };

  const previewVideo = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    setStatus('success');
    setFile(blob);
    setRecordedVideoUrl(url);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {(status === 'streaming' || status === 'recording') && (
          <video
            ref={videoLiveRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '480px',
              objectFit: 'contain'
            }}
          />
        )}
        {status === 'success' && recordedVideoUrl && (
          <video
            ref={videoRtaRef}
            src={recordedVideoUrl}
            controls
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '480px',
              objectFit: 'contain'
            }}
          />
        )}
        {status === 'recording' && (
          <div style={{ marginTop: '10px', color: 'red' }}>
            Recording: {formatDuration(duration)}
          </div>
        )}
        <div style={{ marginTop: '20px' }}>
          {status === 'streaming' && <button onClick={startRecording}>Start Recording</button>}
          {status === 'recording' && <button onClick={stopRecording}>Stop Recording</button>}
          {status === 'success' && <button onClick={() => onSend(file)}>Send Response</button>}
          <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ModalRecording;
