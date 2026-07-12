import katex from "katex";
import { useEffect, useRef } from "react";

const LatexRenderer = ({ math, inline = false }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && math) {
            try {
                katex.render(math, containerRef.current, {
                    displayMode: !inline,
                    throwOnError: false,
                    output: "htmlAndMathml"
                });
            } catch (err) {
                console.error("KaTeX Error:", err);
                containerRef.current.innerText = math;
            }
        }
    }, [math, inline]);

    if (inline) {
        return <span ref={containerRef} />;
    }
    return <div ref={containerRef} className="latex-container" />;
};

const TextWithInlineMath = ({ text }) => {
    if (!text) return null;
    
    // Split by $...$
    const parts = text.split(/(\$.*?\$)/g);
    
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith("$") && part.endsWith("$")) {
                    const math = part.slice(1, -1);
                    return <LatexRenderer key={index} math={math} inline={true} />;
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default function ResultsDisplay({ data, type }) {
    if (!data) return null;

    if (type === "Image") {
        return (
            <div className="results-grid">
                {data.images?.map((img, i) => (
                    <div key={i} className="card result-card">
                        <div className="question-number">Question {img.questionNumber}</div>
                        {img.imageUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL}${img.imageUrl}`} alt={`Question ${img.questionNumber}`} className="image-result" />
                        ) : (
                            <div className="message error">Failed to extract image for this question.</div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (type === "Text") {
        return (
            <div className="results-grid">
                {data.questions?.map((q, i) => (
                    <div key={i} className="card result-card">
                        <div className="question-number">Question {q.questionNumber}</div>
                        
                        <div className="question-text" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            <TextWithInlineMath text={q.questionText} />
                        </div>
                        
                        {q.standaloneEquations && q.standaloneEquations.length > 0 && (
                            <div className="equations-container" style={{ marginBottom: '1.5rem' }}>
                                {q.standaloneEquations.map((eq, j) => (
                                    <LatexRenderer key={j} math={eq} inline={false} />
                                ))}
                            </div>
                        )}

                        {q.options && q.options.length > 0 && (
                            <div className="options-container" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '0.5rem', display: 'grid', gap: '0.75rem' }}>
                                    {q.options.map((opt, j) => (
                                        <li key={j} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '6px' }}>
                                            <strong>({String.fromCharCode(97 + j)})</strong> <TextWithInlineMath text={opt} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {q.containsDiagram && q.diagramUrl ? (
                            <div className="diagram-container" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <img src={`${import.meta.env.VITE_API_URL}${q.diagramUrl}`} alt={`Diagram for Question ${q.questionNumber}`} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                            </div>
                        ) : q.containsDiagram && (
                            <div className="diagram-badge" style={{ marginTop: '1.5rem' }}>Contains Diagram (no image extracted)</div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
