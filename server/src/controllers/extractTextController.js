import { convertPdfToImages, extractRawImages } from "../services/pdfService.js";
import { extractQuestionsFromImages } from "../services/geminiServiceText.js";
import { cropDiagrams } from "../services/imageService.js";
import { removeFile, removeFiles } from "../utils/fileUtils.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractQuestionsText = async (req, res) => {
    const { questionCount } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: "PDF file is required." });
    }

    const tempDir = path.join(__dirname, "../../temp");
    let generatedImagePaths = [];
    let rawImagePaths = [];

    try {
        // 1. Convert PDF to PNGs and extract raw images
        generatedImagePaths = await convertPdfToImages(file.path, tempDir);
        rawImagePaths = await extractRawImages(file.path, tempDir);

        // 2. Send PNGs and raw images to Gemini
        const count = questionCount ? parseInt(questionCount, 10) : null;
        let questions = await extractQuestionsFromImages(generatedImagePaths, rawImagePaths, count);

        // 3. Process Text Output
        // Map the diagramImageIndex to the URL of the native extracted image
        questions = questions.map(q => {
            if (q.containsDiagram && q.diagramImageIndex && rawImagePaths[q.diagramImageIndex - 1]) {
                const imgPath = rawImagePaths[q.diagramImageIndex - 1];
                q.diagramUrl = `/temp/${path.basename(imgPath)}`;
            }
            return q;
        });

        // For questions that STILL don't have a diagramUrl but DO have a diagramRegion, use our cropping fallback!
        const questionsNeedingCrop = questions.filter(q => q.containsDiagram && !q.diagramUrl && q.diagramRegion);
        if (questionsNeedingCrop.length > 0) {
            const cropped = await cropDiagrams(questionsNeedingCrop, generatedImagePaths, tempDir);
            // merge them back
            cropped.forEach(cq => {
                const idx = questions.findIndex(q => q.questionNumber === cq.questionNumber);
                if (idx > -1) questions[idx] = cq;
            });
        }

        // Cleanup the generated page images
        removeFiles(generatedImagePaths);
        // Cleanup unused raw images
        const usedRawPaths = questions.map(q => q.diagramUrl ? path.join(tempDir, path.basename(q.diagramUrl)) : null).filter(Boolean);
        const unusedRawPaths = rawImagePaths.filter(p => !usedRawPaths.includes(p));
        removeFiles(unusedRawPaths);
        
        return res.status(200).json({
            success: true,
            questions: questions.map(q => ({
                questionNumber: q.questionNumber,
                questionText: q.questionText,
                options: q.options || [],
                standaloneEquations: q.standaloneEquations || [],
                containsDiagram: q.containsDiagram,
                diagramUrl: q.diagramUrl
            }))
        });

    } catch (error) {
        import("fs").then(fs => fs.writeFileSync("debug_error.log", error.stack || error.toString()));
        console.error("Extraction Text Controller Error:", error);
        removeFiles(generatedImagePaths);
        removeFiles(rawImagePaths);
        return res.status(500).json({ success: false, message: "Internal server error during text extraction." });
    } finally {
        // Always remove the uploaded PDF
        removeFile(file.path);
    }
};
