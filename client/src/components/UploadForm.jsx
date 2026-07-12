import { useState } from "react";
import { extractQuestions } from "../utils/api";

export default function UploadForm({ onResults, onError }) {
    const [name, setName] = useState("");
    const [questionCount, setQuestionCount] = useState(5);
    const [outputType, setOutputType] = useState("Image");
    const [pdf, setPdf] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!pdf) {
            onError("Please select a PDF file.");
            return;
        }

        setLoading(true);
        onError(null);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("questionCount", questionCount);
        formData.append("outputType", outputType);
        formData.append("pdf", pdf);

        try {
            const data = await extractQuestions(formData);
            onResults(data, outputType);
        } catch (err) {
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter a name for this extraction"
                    required 
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="questionCount">Number of Questions to Extract</label>
                <input 
                    type="number" 
                    id="questionCount" 
                    value={questionCount} 
                    onChange={e => setQuestionCount(e.target.value)} 
                    min="1"
                    max="50"
                    required 
                />
            </div>

            <div className="form-group">
                <label htmlFor="outputType">Output Type</label>
                <select 
                    id="outputType" 
                    value={outputType} 
                    onChange={e => setOutputType(e.target.value)}
                >
                    <option value="Image">Image</option>
                    <option value="Text">Text</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="pdf">Upload PDF</label>
                <input 
                    type="file" 
                    id="pdf" 
                    accept="application/pdf"
                    onChange={e => setPdf(e.target.files[0])} 
                    required 
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? (
                    <>
                        <span className="spinner"></span> Processing PDF...
                    </>
                ) : (
                    "Extract Questions"
                )}
            </button>
        </form>
    );
}
