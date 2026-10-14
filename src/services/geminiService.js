import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import emirPrompt from "../prompts/emirPrompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let ai;

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY manquant. Vérifiez le fichier .env du backend.");
    }

    ai ??= new GoogleGenAI({ apiKey });
    return ai;
}

function getSystemInstruction(memory) {
    if (!memory) return emirPrompt;
    return `${emirPrompt}\n\nMémoire utilisateur:\n${JSON.stringify(memory)}`;
}

export const GeminiService = {
    async chat({ message, memory }) {
        const response = await getClient().models.generateContent({
            model,
            contents: message,
            config: { systemInstruction: getSystemInstruction(memory) }
        });

        return response.text ?? "";
    },

    async stream({ message, memory, onToken }) {
        const stream = await getClient().models.generateContentStream({
            model,
            contents: message,
            config: { systemInstruction: getSystemInstruction(memory) }
        });
        let fullResponse = "";

        for await (const chunk of stream) {
            const token = chunk.text ?? "";
            if (!token) continue;

            fullResponse += token;
            onToken?.(token);
        }

        return fullResponse;
    }
};