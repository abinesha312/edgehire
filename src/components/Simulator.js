
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';


const Simulator = () => {
    const [isModalOpen, setIsModalOpen] = useState(true); // Open modal by default
    const [jobRole, setJobRole] = useState(''); // Store job role input
    const [level, setLevel] = useState(''); // Store level input
    const [questions, setQuestions] = useState(null); // Store questions received from API
    const [loading, setLoading] = useState(false); // Loading state for API call
    const [recordingStarted, setRecordingStarted] = useState(false); // Manage recording state
    const [recordedChunks, setRecordedChunks] = useState([]); // Store recorded video/audio chunks
    const [transcription, setTranscription] = useState(''); // Store transcription result
    const [showPreview, setShowPreview] = useState(false);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [evaluations, setEvaluations] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null); // New state for video preview URL
    const previewRef = useRef(null);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [userResponse, setUserResponse] = useState('');
    const videoRef = useRef(null); // Ref for the video element
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const colors = {
        darkGreen: '#31473A',
        lightGreen: '#EDF4F2',
        mediumGreen: '#2C5F2D',
        pastelGreen: '#97BC62',
        white: '#FFFFFF'
    };


    useEffect(() => {
        // Access the user's webcam stream and set it to the video element
        const getVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true, // Capture both video and audio
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setRecordedChunks((prev) => [...prev, event.data]);
                    }
                };

                console.log("MediaRecorder initialized");
            } catch (err) {
                console.error("Error accessing webcam and microphone: ", err);
            }
        };

        getVideo();
    }, []);

    /**
     * Handle form submission to call the API and generate questions
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (jobRole && level) {
            setLoading(true); // Set loading state to true before API call

            // Prepare API request payload
            const payload = {
                role: jobRole,
                level: level,
            };


            try {
                Cookies.set('role', jobRole);
                Cookies.set('level', level);
                // Make API call to generate questions
                // const response = await fetch('https://sw932b4q1ot74v-5000.proxy.runpod.net/generate_questions', {
                const response = await fetch('http://127.0.0.1:5000/generate_questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }

                const data = await response.json();
                setQuestions(Object.values(data.questions)); // Extract questions from response
                setIsModalOpen(false); // Close modal after successful API call
            } catch (error) {
                console.error('Error generating questions:', error);
                alert('Failed to generate questions. Please try again.');
            } finally {
                setLoading(false); // Set loading state to false after API call
            }
        } else {
            alert('Please fill out both fields!');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    /**
     * Handle start recording functionality
     */
    const startRecording = () => {
        setRecordedChunks([]);
        if (mediaRecorder && mediaRecorder.state === "inactive") {
            mediaRecorder.start();
            setRecordingStarted(true);
            console.log("Recording started.");
        } else {
            console.log("MediaRecorder is not initialized or already recording.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setRecordingStarted(false);
            console.log("Recording stopped.");
        } else {
            console.log("Recording is not in progress.");
        }
    };

    useEffect(() => {
        const storedEvaluations = localStorage.getItem('evaluations');
        if (storedEvaluations) {
            setEvaluations(JSON.parse(storedEvaluations));
        }
    }, []);


    const processRecording = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log('Blob size:', blob.size, 'bytes');

        if (blob.size > 0) {
            setIsUploading(true);
            setUploadProgress(0);

            const chunkSize = 1024 * 1024; // 1MB chunks
            const totalChunks = Math.ceil(blob.size / chunkSize);

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, blob.size);
                const chunk = blob.slice(start, end);

                const formData = new FormData();
                formData.append('file', chunk, `chunk_${chunkIndex}`);
                formData.append('chunkIndex', chunkIndex);
                formData.append('totalChunks', totalChunks);

                try {
                    const response = await fetch('https://sw932b4q1ot74v-5000.proxy.runpod.net/upload_chunk', {
                        // const response = await fetch('http://127.0.0.1:5000/upload_chunk', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    setUploadProgress(((chunkIndex + 1) / totalChunks) * 100);
                } catch (error) {
                    console.error('Error uploading chunk:', error);
                    setIsUploading(false);
                    return;
                }
            }

            try {
                const transcribeResponse = await fetch('https://sw932b4q1ot74v-5000.proxy.runpod.net/transcribe_video', {
                    // const transcribeResponse = await fetch('http://127.0.0.1:5000/transcribe_video', {
                    method: 'POST',
                });

                if (!transcribeResponse.ok) {
                    throw new Error(`HTTP error! status: ${transcribeResponse.status}`);
                }

                const data = await transcribeResponse.json();
                console.log('Transcription received:', data.transcription);
                setTranscription(data.transcription);

                // Automatically evaluate the response using the transcription
                await evaluateResponse(data.transcription);
            } catch (error) {
                console.error('Error transcribing video:', error);
            } finally {
                setIsUploading(false);
            }
        } else {
            console.error('Recorded blob is empty.');
        }
    };

    const evaluateResponse = async (responseText) => {
        const role = Cookies.get('role');
        const level = Cookies.get('level');
        const currentQuestion = questions[currentQuestionIndex];

        if (!currentQuestion) {
            alert('No question selected.');
            return;
        }

        const payload = {
            question: currentQuestion,
            response: responseText,
            role: role,
            level: level,
        };

        try {
            const response = await fetch('https://sw932b4q1ot74v-5000.proxy.runpod.net/evaluate_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate response');
            }

            const data = await response.json();
            console.log('Evaluation Result:', data.evaluation);

            // Save evaluation to state and local storage
            setEvaluations(prev => {
                const newEvaluations = { ...prev, [currentQuestion]: data.evaluation };
                localStorage.setItem('evaluations', JSON.stringify(newEvaluations));
                return newEvaluations;
            });

            alert(`Evaluation: ${data.evaluation}`);
        } catch (error) {
            console.error('Error evaluating response:', error);
            alert('Failed to evaluate response. Please try again.');
        }
    };


    const closePreview = () => {
        setShowPreview(false);
    };
    useEffect(() => {
        if (!recordingStarted && recordedChunks.length > 0) {
            processRecording();
        }
    }, [recordingStarted, recordedChunks]);

    const toggleRecording = () => {
        if (!recordingStarted) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const submitResponse = async () => {
        const role = Cookies.get('role');
        const level = Cookies.get('level');
        const currentQuestion = questions[currentQuestionIndex];

        if (!currentQuestion) {
            alert('No question selected.');
            return;
        }

        if (!userResponse) {
            alert('Please enter your response.');
            return;
        }

        const payload = {
            question: currentQuestion,
            response: userResponse,
            role: role,
            level: level,
        };

        try {
            const response = await fetch('https://sw932b4q1ot74v-5000.proxy.runpod.net/evaluate_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to evaluate response');
            }

            const data = await response.json();
            console.log('Evaluation Result:', data.evaluation);

            // Save evaluation to state and local storage
            setEvaluations(prev => {
                const newEvaluations = { ...prev, [currentQuestion]: data.evaluation };
                localStorage.setItem('evaluations', JSON.stringify(newEvaluations));
                return newEvaluations;
            });

            alert(`Evaluation: ${data.evaluation}`);
        } catch (error) {
            console.error('Error evaluating response:', error);
            alert('Failed to evaluate response. Please try again.');
        }
    };



    const sendVideoForTranscription = async () => {
        if (!videoBlob) return;

        const formData = new FormData();
        formData.append('video', videoBlob);

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Transcription:', data.transcription);
        } catch (error) {
            console.error('Error sending video for transcription:', error);
        }
    };

    const HoverPopup = ({ evaluation }) => {
        if (!evaluation) return null;

        const parseEvaluation = (text) => {
            const sections = text.split(/\*\*(.*?):\*\*/);
            const parsed = [];
            for (let i = 1; i < sections.length; i += 2) {
                parsed.push({
                    title: sections[i],
                    content: sections[i + 1].trim()
                });
            }
            return parsed;
        };

        const parsedEvaluation = parseEvaluation(evaluation);

        return (
            <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                zIndex: 1000,
                maxWidth: '300px',
                fontSize: '14px',
                color: 'black'
            }}>
                {parsedEvaluation.map((section, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{section.title}</strong>
                        <p>{section.content}</p>
                    </div>
                ))}
            </div>
        );
    };



    const QuestionItem = ({ question, isSelected, onSelect, evaluation }) => {
        const [showPopup, setShowPopup] = useState(false);

        return (
            <li
                style={{
                    marginBottom: '10px',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '5px',
                    backgroundColor: isSelected ? '#f0f0f0' : 'transparent',
                    borderRadius: '5px'
                }}
                onMouseEnter={() => setShowPopup(true)}
                onMouseLeave={() => setShowPopup(false)}
            >
                <label>
                    <input
                        type="radio"
                        name="question"
                        value={question}
                        checked={isSelected}
                        onChange={() => onSelect(question)}
                    />
                    {question}
                </label>
                {showPopup && evaluation && <HoverPopup evaluation={evaluation} />}
            </li>
        );
    };

    const handlePrevQuestion = () => {
        setCurrentQuestionIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : questions.length - 1
        );
    };

    const handleNextQuestion = () => {
        setCurrentQuestionIndex((prevIndex) =>
            prevIndex < questions.length - 1 ? prevIndex + 1 : 0
        );
    };

    const arrowStyle = {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
    };

    const QuestionCarousel = () => {
        useEffect(() => {
            if (questions && questions.length > 0) {
                const currentQuestion = questions[currentQuestionIndex];
                setSelectedQuestion(currentQuestion);
            }
        }, [currentQuestionIndex, questions]);

        if (!questions || questions.length === 0) {
            return <p>No questions available yet.</p>;
        }

        const currentQuestion = questions[currentQuestionIndex];

        return (
            <div style={{ padding: '20px', position: 'relative' }}>
                <h2>Generated Questions</h2>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <strong>Question {currentQuestionIndex + 1}/{questions.length}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={handlePrevQuestion} style={arrowStyle}>
                        <FaArrowLeft />
                    </button>
                    <div style={{ flex: 1, padding: '0 20px' }}>
                        <p style={{ textAlign: 'justify', minHeight: '100px' }}>{currentQuestion}</p>
                        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', maxHeight: '350px', overflow: 'auto' }}>
                            <strong>Response:</strong>
                            <p>
                                {evaluations[currentQuestion] || "No Response. Kindly answer this question."}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleNextQuestion} style={arrowStyle}>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        );
    };





    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Left side: Display generated questions */}
            {/* <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <h2>Generated Questions</h2>
                {!isModalOpen && (
                    <div>
                        {questions ? (
                            <div>
                                <ul style={{ listStyleType: 'none', padding: 0, display: 'block' }}>
                                    {questions.map((question, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                marginBottom: '10px',
                                                position: 'relative',
                                                display: 'block', // Ensure items are displayed as block elements
                                            }}
                                        >
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="question"
                                                    value={question}
                                                    checked={selectedQuestion === question}
                                                    onChange={(e) => setSelectedQuestion(e.target.value)}
                                                />
                                                {question}
                                            </label>
                                            {evaluations[question] && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '0',
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #ccc',
                                                        padding: '10px',
                                                        zIndex: 1,
                                                        width: '300px',
                                                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                                    }}
                                                >
                                                    <strong>Evaluation:</strong>
                                                    <p>{evaluations[question]}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p>No questions available yet.</p>
                        )}
                    </div>
                )}
            </div> */}
            <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                {!isModalOpen && <QuestionCarousel />}
            </div>

            {/* Right side: Display the live webcam stream */}
            <div style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Video and Button Container */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px', // Adds space between the video and button
                    width: '100%',
                }}>
                    <video
                        ref={videoRef}
                        style={{
                            width: '50%',
                            maxWidth: '470px',
                            maxHeight: '480px',
                            border: '2px solid #ccc',
                            borderRadius: '10px'
                        }}
                        autoPlay
                    />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100px',
                            height: '100px',
                        }}
                    >
                        <button
                            onClick={toggleRecording}
                            style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: recordingStarted ? 'red' : 'green',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                clipPath: recordingStarted
                                    ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' // Hexagon
                                    : 'polygon(50% 0%, 100% 100%, 0% 100%)', // Triangle
                                transform: 'rotate(90deg)', // Rotate shape
                            }}
                        >
                            <span
                                style={{
                                    transform: 'rotate(-90deg)', // Counter-rotate text
                                    color: 'white',
                                    fontWeight: 'bold',
                                    paddingRight: '20px'
                                }}
                            >
                                {recordingStarted ? 'Stop' : 'Start'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Uploading Section */}
                {isUploading && (
                    <div style={{ marginTop: '20px' }}>
                        Uploading: {uploadProgress.toFixed(2)}%
                    </div>
                )}

                {/* Video Preview Popup */}
                {showPreview && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            maxWidth: '80%',
                            maxHeight: '80%',
                            overflow: 'auto'
                        }}>
                            <h3>Recording Preview</h3>
                            <video
                                ref={previewRef}
                                src={previewUrl}
                                controls
                                style={{
                                    width: '100%',
                                    maxHeight: '70vh',
                                    border: '2px solid #ccc',
                                    borderRadius: '10px'
                                }}
                            />
                            <button
                                onClick={closePreview}
                                style={{
                                    marginTop: '10px',
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                )}

                {/* Response Section */}
                <div className="response-section" style={{ marginTop: '20px', width: '100%', maxWidth: '640px' }}>
                    <span className="input-label">Your Response:</span>
                    <textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Type your response here..."
                        rows={6}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px'
                        }}
                    />
                    <button
                        onClick={submitResponse}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Submit Response
                    </button>
                </div>

                {/* Transcription Section */}
                {transcription && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <h3>Transcription Result</h3>
                        <p>{transcription}</p>
                    </div>
                )}
                {/* <button
                    onClick={sendVideoForTranscription}
                    style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: '#4CAF50',
                        border: 'none',
                        borderRadius: '10px',
                        marginTop: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Transcribe
                </button> */}
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '400px',
                        }}
                    >

                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                            }}
                        >
                            &times;
                        </button>

                        <h3>Setup Interview</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>
                                    Job Role:
                                    <input
                                        type="text"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        placeholder="Enter job role"
                                        style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>
                                    Level:
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
                                    >
                                        <option value="">Select level</option>
                                        <option value="Junior">Junior</option>
                                        <option value="Mid-level">Mid-level</option>
                                        <option value="Senior">Senior</option>
                                    </select>
                                </label>
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                                disabled={loading} // Disable button while loading
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulator;
