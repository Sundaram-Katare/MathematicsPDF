import fs from "fs";
import { model } from "../config/gemini.js";
import { questionExtractionPrompt } from "../prompts/geminiPromptsImage.js";

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

export const extractQuestionsFromImages = async (imagePaths, requiredCount) => {
    try {
        const imageParts = imagePaths.map(path => fileToGenerativePart(path, "image/png"));
        
        let prompt = questionExtractionPrompt;
        if (requiredCount) {
            prompt += `\n\nNOTE: You only need to extract up to ${requiredCount} questions. Stop after finding ${requiredCount}.`;
        }

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : text;
        
        const parsed = JSON.parse(jsonString);
        return parsed;
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw new Error("Failed to extract questions using Gemini API.");
    }
};
