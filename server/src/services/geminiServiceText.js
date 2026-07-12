import fs from "fs";
import { model } from "../config/gemini.js";
import { questionExtractionPrompt } from "../prompts/geminiPromptsText.js";

function fileToGenerativePart(filePath, mimeType = null) {
    let type = mimeType;
    if (!type) {
        if (filePath.endsWith('.png')) type = 'image/png';
        else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) type = 'image/jpeg';
        else if (filePath.endsWith('.webp')) type = 'image/webp';
        else type = 'image/jpeg'; // fallback
    }

    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType: type
        },
    };
}

export const extractQuestionsFromImages = async (pageImagePaths, rawImagePaths, requiredCount) => {
    try {
        const contents = [questionExtractionPrompt];
        
        if (requiredCount) {
            contents[0] += `\n\nNOTE: You only need to extract up to ${requiredCount} questions. Stop after finding ${requiredCount}.`;
        }

        contents.push("\n--- PDF PAGES ---");
        pageImagePaths.forEach((path, i) => {
            contents.push(`\nPage ${i + 1}:`);
            contents.push(fileToGenerativePart(path, "image/png"));
        });

        contents.push("\n--- EXTRACTED RAW IMAGES ---");
        if (rawImagePaths && rawImagePaths.length > 0) {
            rawImagePaths.forEach((path, i) => {
                contents.push(`\nExtracted Image ${i + 1}:`);
                contents.push(fileToGenerativePart(path, "image/png")); // pdf-export-images might output jpg, but inline format handles base64 well. We should get correct mime if possible, but let's stick to png/jpeg fallback.
            });
        } else {
            contents.push("\nNo extracted images found.");
        }

        const result = await model.generateContent(contents);
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
