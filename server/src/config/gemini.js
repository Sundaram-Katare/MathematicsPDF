import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in the environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
