import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultsDisplay from "./components/ResultDisplay";

function App() {
    const [results, setResults] = useState(null);
    const [outputType, setOutputType] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleResults = (data, type) => {
        setResults(data);
        setOutputType(type);
        setSuccessMsg(`Successfully extracted ${type === 'Image' ? data.images?.length : data.questions?.length} questions!`);
        setTimeout(() => setSuccessMsg(null), 5000);
    };

    return (
        <div className="container">
            <h1>PDF Math Extractor</h1>
            
            {error && <div className="message error">{error}</div>}
            {successMsg && <div className="message success">{successMsg}</div>}

            <UploadForm onResults={handleResults} onError={setError} />

            {results && <ResultsDisplay data={results} type={outputType} />}
        </div>
    );
}

export default App;
