# EdgeHire: AI-Powered Interview Simulation Platform

## 🚀 Project Overview

EdgeHire is an **AI-driven interview simulation platform** designed to help users prepare for job interviews through realistic and interactive experiences. By leveraging **advanced AI models**, the platform generates interview questions, records and transcribes user responses, and evaluates those responses with detailed feedback. This ensures users can practice and improve their interview skills efficiently.

---

## 🌟 Key Features

### ✅ AI-Powered Interview Questions

- Utilizes **OpenAI's GPT models** and **FAISS vector search** to generate job-specific questions.
- Questions are tailored based on the **job role** and **experience level**.

### ✅ Lightweight AI Integration

- Hosted on **RunPod** to reduce local computational load.
- Uses **cloud-based AI models** for scalability and efficiency.

### ✅ Real-Time Response Transcription & Evaluation

- Uses **OpenAI Whisper** for **speech-to-text transcription**.
- AI-based evaluation **grades responses** based on **relevance, depth, and clarity**.

### ✅ Rich Question Dataset

- **Scrapes GeeksforGeeks** for **technical questions**.
- Processes and stores data using **FAISS vector search** for quick retrieval.

---

## 🏗️ System Architecture

EdgeHire follows a **modular architecture** with a **React frontend** and a **Flask backend**, ensuring a **seamless user experience**.

### **Frontend (React) 🖥️**

- Built using **React.js**.
- Core components:
  - `Simulator.js`: Manages interview simulation.
  - `Demo.js`: Handles UI interactions.
- Features:
  - Users **navigate through questions**.
  - Record responses with **video/audio support**.
  - View **AI-generated feedback**.

### **Backend (Flask) 🔥**

- Provides API endpoints for:
  - `/generate_questions` → Generates interview questions.
  - `/evaluate_response` → Analyzes user responses.
  - `/transcribe_video` → Converts recorded video into text.
- Integrates with **FAISS vector store** for **efficient question retrieval**.
- Uses **Whisper AI** for **speech-to-text transcription**.

---

## 📊 Detailed Interaction Flow

### **1️⃣ User Interaction**

1. User selects **job role** and **experience level**.
2. The frontend sends a **request to the backend** to generate **interview questions**.

### **2️⃣ Question Generation**

1. Backend **retrieves relevant questions** from the **FAISS vector store**.
2. AI **generates new questions** based on job requirements.
3. Questions are sent to the frontend **for display**.

### **3️⃣ Response Recording & Transcription**

1. The user records **video/audio responses**.
2. The video is sent to the backend for **transcription using Whisper AI**.
3. The transcribed text is **sent back to the frontend**.

### **4️⃣ AI-Based Response Evaluation**

1. The **transcribed response** is sent to the backend.
2. AI **analyzes and scores** the response based on:
   - **Relevance** to the question.
   - **Depth of knowledge**.
   - **Clarity and articulation**.
3. Evaluation **results** (score + feedback) are displayed to the user.

---

## 🚀 Hosting on RunPod (Cloud GPU)

EdgeHire is **deployed on RunPod**, which provides **powerful GPUs** at affordable hourly rates.

### **⚡ RunPod Configurations Used:**

| Plan                | Specs                        | Price    |
| ------------------- | ---------------------------- | -------- |
| **RTX 4090**        | 24GB VRAM, 29GB RAM, 6 vCPUs | $0.69/hr |
| **Secure Cloud**    | Scalable cloud service       | $0.34/hr |
| **Community Cloud** | Low-cost shared cloud        | $0.34/hr |

### **💡 Why RunPod?**

- **Affordable** GPU hosting.
- **Scalable performance** for AI workloads.
- **No local hardware dependency**.

### **🛠️ Deployment Steps on RunPod**

1. **Select an instance** (RTX 4090 recommended for AI workloads).
2. **Pull the EdgeHire repository**:
   ```bash
   git clone https://github.com/abinesha312/edgehire.git
   cd edgehire
   ```
3. **Install dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   cd frontend && npm install
   ```
4. **Run the Flask backend**:
   ```bash
   cd backend
   python app.py
   ```
5. **Start the React frontend**:
   ```bash
   cd ../frontend
   npm start
   ```
6. **Access the platform** via `http://<RunPod-instance-IP>:3000`.

---

## 🔧 Implementation Details

### **AI Model Integration**

- **OpenAI GPT** → Generates realistic **interview questions**.
- **FAISS Vector Store** → Efficient **question retrieval**.
- **Whisper AI** → Converts **spoken responses to text**.

### **Data Scraping (GeeksforGeeks)**

- Python script (`ingest.py`):
  - **Fetches** HTML content.
  - **Cleans & processes** text.
  - **Stores questions in FAISS**.

### **Security Best Practices**

✅ **Environment Variables** (`.env` for secrets).  
✅ **API Key Management** (OpenAI keys securely stored).  
✅ **GitHub Secret Scanning** enabled.

---

## 🎯 Future Improvements

🔹 **Support for multi-round interview simulations**.  
🔹 **Integrate facial expression analysis for better feedback**.  
🔹 **Automated resume analysis & suggestion system**.

---

## 📜 License

MIT License - Feel free to use and contribute!

---

## 💬 Need Help?

If you have any questions, feel free to open an **issue** or contact **@abinesha312** on GitHub!

🔗 **GitHub Repository**: [EdgeHire](https://github.com/abinesha312/edgehire)
