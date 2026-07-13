# AI PDF Mathematics Extractor

A full-stack web application designed to automate the digitization of educational textbooks and mathematical PDFs. The system takes unstructured PDF documents—like math worksheets or exam papers—and parses them into structured formats (JSON) using Multimodal LLMs, extracting both text and images pixel-perfectly.

## 🚀 Features

- **Multimodal AI Extraction:** Leverages the Gemini Vision API to accurately read complex mathematical notation, identifying inline variables, standalone equations, and multiple-choice options.
- **LaTeX Math Support:** Automatically parses and structures mathematical equations into valid LaTeX for seamless rendering on the web.
- **Pure WebAssembly PDF Engine:** Utilizes `mupdf` compiled into WebAssembly for high-resolution page rasterization. This provides incredible performance with **zero native OS binary dependencies** (like poppler or Ghostscript), making it universally deployable on any Linux server, Docker container, or serverless environment.
- **Dual Processing Pipelines:**
  - **Image Mode:** Employs AI-generated bounding boxes to accurately crop individual questions directly from the high-res page image.
  - **Text Mode:** Uses `pdf-export-images` to natively extract embedded diagram objects from the PDF byte stream without quality loss, falling back gracefully to AI bounding box crops if the PDF structure is malformed.
- **Modern UI/UX:** Built with React, Vite, and Tailwind CSS, featuring drag-and-drop uploads, format toggles, and responsive result cards.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Multer (for file handling)
- **PDF Processing:** `mupdf` (WebAssembly), `pdf-export-images`
- **AI / LLM:** Google Gemini Vision API (`@google/generative-ai`)
- **Image Processing:** `sharp`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/                # Components and styles
│   └── package.json        
└── server/                 # Express backend
    ├── src/
    │   ├── controllers/    # API endpoint logic (separated by Image/Text)
    │   ├── prompts/        # Gemini LLM instruction prompts
    │   ├── routes/         # Express router definitions
    │   └── services/       # PDF parsing, Image cropping, and AI calls
    ├── temp/               # Ephemeral storage for page rasterization
    ├── uploads/            # Temporary storage for PDF uploads
    └── package.json
```

## ⚙️ Setup Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies

**For the Backend:**
```bash
cd server
npm install
```

**For the Frontend:**
```bash
cd client
npm install
```

### 3. Environment Variables
You will need a Gemini API Key. 
Create a `.env` file inside the `server/` directory and add your key:
```env
PORT=5000
GEMINI_API_KEY=your_api_key_here
```

Create a `.env` file inside the `client/` directory and add your key:
```env
VITE_API_URL=https://localhost:5000
```

### 4. Running the Application Locally

Start the backend server:
```bash
cd server
npm run start
```
*(The backend runs on `http://localhost:5000`)*

Start the frontend development server:
```bash
cd client
npm run dev
```
*(The frontend usually runs on `http://localhost:5173`)*

## 💡 How it Works (Architecture)

1. A user uploads a PDF via the React interface.
2. The Express server stores the file temporarily and spins up the `mupdf` WebAssembly engine.
3. `mupdf` rasterizes the PDF pages into high-resolution PNG images.
4. The backend streams these images, alongside a strictly engineered prompt, to the Gemini Vision API.
5. Gemini identifies the bounding boxes of questions, parses the mathematical text, separates multiple-choice options, and returns a structured JSON payload.
6. Depending on the user's selected mode (Text vs. Image), the backend either natively extracts the diagrams from the PDF stream or uses the `sharp` library to crop the question images.
7. The structured payload is sent back to the client and beautifully rendered. Temporary files are immediately wiped from the server.
