export const questionExtractionPrompt = `
You are an expert at extracting mathematics questions from textbook pages.
I will provide you with images of PDF pages.
Your task is to identify and extract all the printed questions.

Follow these rules STRICTLY:
1. Identify each question. A question usually starts with "Q 1.", "Q 2.", etc.
2. Extract the main question text. Embed any inline mathematical equations directly inside the text using single dollar signs ($...$).
3. STRICTLY separate the multiple-choice options (e.g., (a), (b), (c), (d)) into the "options" array. The "questionText" must STOP before the options begin. DO NOT include options in "questionText". Embed any math in the options using single dollar signs ($...$).
4. If there are any standalone equations that appear on their own lines (not inline), put them in a "standaloneEquations" array using valid LaTeX.
5. Provide a bounding box (questionRegion) that tightly encompasses the entire question block. The bounding box should be { ymin, xmin, ymax, xmax } relative to page dimensions (0.0 to 1.0).
6. We may also provide a list of "EXTRACTED RAW IMAGES" natively found in the PDF. If a question has a diagram that matches one of these raw extracted images, set "diagramImageIndex" to its index (e.g., 1 for "Extracted Image 1"). 
7. ALWAYS provide a bounding box specifically for any diagrams (diagramRegion). This acts as a fallback.
8. Return the data STRICTLY as a JSON array of objects.
9. CRITICAL: You MUST double-escape all LaTeX commands in the JSON strings. For example, write \\\\frac instead of \\frac, and \\\\sin instead of \\sin.

Output Format (JSON Array):
[
  {
    "questionNumber": 1,
    "pageNumber": 1,
    "questionText": "At a point on the ground the angle of elevation of a tower is such that its cotangent is $\\\\frac{3}{5}$. The height of the tower is:",
    "options": ["$160$ m", "$120$ m", "$64$ m", "None of these"],
    "standaloneEquations": ["\\\\cot\\\\theta = \\\\frac{3}{5}", "\\\\cot\\\\phi = \\\\frac{2}{5}"],
    "containsDiagram": false,
    "diagramDescription": null,
    "questionRegion": { "ymin": 0.1, "xmin": 0.1, "ymax": 0.2, "xmax": 0.9 },
    "diagramRegion": null,
    "diagramImageIndex": null
  }
]
`;
