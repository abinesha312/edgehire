from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
from langchain_ollama import OllamaLLM
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from openai import OpenAI
import whisper
from io import BytesIO
from tempfile import NamedTemporaryFile
import re
import os
import logging
import ffmpeg
from dotenv import load_dotenv
from dotenv import dotenv_values
en = dotenv_values("../.env")


load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
global_db = None

# Load the FAISS vector store
def load_db():
    global global_db
    if global_db is None:
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-mpnet-base-v2",
                model_kwargs={'device': 'cpu'}  # Change 'cpu' to 'cuda'
            )

            global_db = FAISS.load_local(
                'E:/Masters Of Computer Science/Semester/04_Fall_2024/CSCE 5200_Info_Retri/07_Project/vectorstore/db_faiss',
                embeddings,
                allow_dangerous_deserialization=True
            )
            
            if global_db is None:
                raise ValueError("Failed to load FAISS vector store")
        except Exception as e:
            logger.error(f"Error loading FAISS vector store: {e}")
            traceback.print_exc()
    return global_db

# Load the Ollama LLM
llm = OllamaLLM(
    model="llama3",
    base_url="http://localhost:11434",
    verbose=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# OpenAI client setup
client = OpenAI(api_key=en.OPENAI_API_KEY)

# Load the Whisper model globally
model = whisper.load_model("base").to("cpu")

UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max file size

@app.route('/upload_chunk', methods=['POST'])
def upload_chunk():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    chunk_index = int(request.form['chunkIndex'])
    total_chunks = int(request.form['totalChunks'])
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        try:
            filename = f"temp_video_{chunk_index}.webm"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            if chunk_index == total_chunks - 1:
                # All chunks received, combine them
                with open(os.path.join(app.config['UPLOAD_FOLDER'], 'complete_video.webm'), 'wb') as outfile:
                    for i in range(total_chunks):
                        chunk_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_video_{i}.webm")
                        with open(chunk_path, 'rb') as infile:
                            outfile.write(infile.read())
                        os.remove(chunk_path)
                
                return jsonify({'message': 'File upload complete'}), 200
            
            return jsonify({'message': f'Chunk {chunk_index + 1}/{total_chunks} received'}), 200
        except Exception as e:
            logger.error(f"Error in upload_chunk: {e}")
            return jsonify({'error': 'File upload failed'}), 500
    
    return jsonify({'error': 'File upload failed'}), 400


@app.route('/evaluate_response', methods=['POST'])
def evaluate_response():
    try:
        data = request.json
        question = data.get('question')
        response = data.get('response')
        role = data.get('role', 'Software Developer')
        level = data.get('level', 'Junior')

        if not question or not response:
            return jsonify({'error': 'Question and response are required'}), 400

        prompt = f"""
        As an expert interviewer, evaluate the following response for a {level} {role} position.

        Question: {question}

        Candidate's Response: {response}

        Please provide an evaluation of the response considering the following criteria:
        1. Relevance to the question
        2. Depth of knowledge
        3. Clarity of explanation
        4. Practical application (if applicable)
        5. Areas for improvement

        Give a score out of 10 and a brief explanation for your evaluation.
        """

        evaluation = llm(prompt)
        score_match = re.search(r'(\d+(?:\.\d+)?)\s*\/\s*10', evaluation)
        score = float(score_match.group(1)) if score_match else None

        return jsonify({
            'evaluation': evaluation,
            'score': score
        }), 200

    except Exception as e:
        logger.error(f"Error evaluating response: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal Server Error'}), 500
    

@app.route('/transcribe_video', methods=['POST'])
def transcribe_video():
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], 'complete_video.webm')
    if not os.path.exists(video_path):
        return jsonify({'error': 'Video file not found'}), 404

    try:
        # Convert WebM to WAV
        wav_path = os.path.join(app.config['UPLOAD_FOLDER'], 'audio.wav')
        stream = ffmpeg.input(video_path)
        stream = ffmpeg.output(stream, wav_path)
        ffmpeg.run(stream, overwrite_output=True)

        # Transcribe the WAV file using OpenAI's Whisper model
        with open(wav_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        
        # Clean up
        os.remove(video_path)
        os.remove(wav_path)
        print(transcription.text)
        
        return jsonify({'transcription': transcription.text}), 200
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return jsonify({'error': f'Transcription failed: {str(e)}'}), 500


@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        role = data.get('role', 'Software Developer')
        level = data.get('level', 'Junior')

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert interviewer."},
                {
                    "role": "user",
                    "content": f"Generate 10 interview questions for the role of {role} and the experience level of {level}.",
                }
            ]
        )

        response_text = completion.choices[0].message.content.strip()
        question_lines = re.findall(r'- (.*)', response_text)
        questions = question_lines
        
        return jsonify({'questions': questions})
    
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
