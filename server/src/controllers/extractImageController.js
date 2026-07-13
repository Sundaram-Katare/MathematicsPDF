import { convertPdfToImages } from "../services/pdfService.js";
import { extractQuestionsFromImages } from "../services/geminiServiceImage.js";
import { cropQuestions } from "../services/imageService.js";
import { removeFile, removeFiles } from "../utils/fileUtils.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractQuestionsImage = async (req, res) => {
    const { questionCount } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: "PDF file is required." });
    }

    const tempDir = path.join(__dirname, "../../temp");
    let generatedImagePaths = [];

    try {
        // 1. Convert PDF to PNGs
        generatedImagePaths = await convertPdfToImages(file.path, tempDir);

        // 2. Send PNGs to Gemini
        const count = questionCount ? parseInt(questionCount, 10) : null;
        let parsedResult = await extractQuestionsFromImages(generatedImagePaths, count);
        let questions = Array.isArray(parsedResult) ? parsedResult : (parsedResult.questions || []);

        // 3. Crop Images
        questions = await cropQuestions(questions, generatedImagePaths, tempDir);
        
        // Cleanup the original high-res pages, keep the cropped ones in temp
        removeFiles(generatedImagePaths);
        
        // 4. Format Output
        return res.status(200).json({
            success: true,
            images: questions.map(q => ({
                questionNumber: q.questionNumber,
                imageUrl: q.imageUrl
            }))
        });

    } catch (error) {
        import("fs").then(fs => fs.writeFileSync("debug_error.log", error.stack || error.toString()));
        console.error("Extraction Image Controller Error:", error);
        removeFiles(generatedImagePaths);
        return res.status(500).json({ success: false, message: "Internal server error during image extraction." });
    } finally {
        // Always remove the uploaded PDF
        removeFile(file.path);
    }
};
