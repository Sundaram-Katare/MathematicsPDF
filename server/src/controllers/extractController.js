import { extractQuestionsImage } from "./extractImageController.js";
import { extractQuestionsText } from "./extractTextController.js";

export const extractQuestions = async (req, res) => {
    const { outputType } = req.body;

    if (outputType === "Image") {
        return extractQuestionsImage(req, res);
    } else {
        return extractQuestionsText(req, res);
    }
};
