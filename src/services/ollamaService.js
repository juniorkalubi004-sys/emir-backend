import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import emirPrompt from "../prompts/emirPrompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const apiUrl = process.env.OLLAMA_API_URL || "https://ollama.com/api/generate";
const defaultModel = process.env.OLLAMA_DEFAULT_MODEL || "gpt-oss:120b-cloud";

function getSystemPrompt(memory) {
    if (!memory) return emirPrompt;
    return `${emirPrompt}\n\nMémoire utilisateur:\n${JSON.stringify(memory)}`;
}

function getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const apiKey = process.env.OLLAMA_API_KEY;
    const hostname = new URL(apiUrl).hostname;
    const isOllamaCloud = hostname === "ollama.com" || hostname.endsWith(".ollama.com");

    if (isOllamaCloud && !apiKey?.trim()) {
        const error = new Error("OLLAMA_API_KEY est nécessaire pour utiliser Ollama Cloud.");
        error.publicMessage = "Clé Ollama manquante : renseignez OLLAMA_API_KEY dans emir/backend/.env, puis redémarrez le backend.";
        throw error;
    }
    if (apiKey?.trim()) headers.Authorization = `Bearer ${apiKey.trim()}`;
    return headers;
}

function createPayload({ message, memory, model, images, stream }) {
    if (typeof message !== "string" || !message.trim()) {
        throw new Error("Un message est requis pour appeler Ollama.");
    }
    if (model !== undefined && (typeof model !== "string" || !model.trim())) {
        throw new Error("Le modèle Ollama fourni est invalide.");
    }
    if (images !== undefined && (!Array.isArray(images) || images.some((image) => typeof image !== "string"))) {
        throw new Error("Les images Ollama doivent être fournies sous forme de tableau de chaînes.");
    }

    return {
        model: model || defaultModel,
        system: getSystemPrompt(memory),
        prompt: message,
        ...(images?.length ? { images } : {}),
        stream
    };
}

async function readError(response) {
    const details = await response.text();
    const error = new Error(`Erreur Ollama (${response.status}): ${details || response.statusText}`);
    if (response.status === 401 || response.status === 403) {
        error.publicMessage = "Ollama a refusé l’accès : vérifiez que OLLAMA_API_KEY est valide et active dans emir/backend/.env.";
    } else if (response.status === 404) {
        error.publicMessage = "Modèle ou URL Ollama introuvable : vérifiez OLLAMA_DEFAULT_MODEL et OLLAMA_API_URL dans emir/backend/.env.";
    } else {
        error.publicMessage = `Ollama a renvoyé une erreur HTTP ${response.status}. Consultez le terminal du backend pour plus de détails.`;
    }
    return error;
}

class Ollama {
    async chat(options) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(createPayload({ ...options, stream: false }))
        });

        if (!response.ok) throw await readError(response);

        const data = await response.json();
        if (typeof data.response !== "string") {
            throw new Error("Réponse Ollama invalide : le texte généré est absent.");
        }
        return data.response;
    }

    async stream({ onToken, ...options }) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(createPayload({ ...options, stream: true }))
        });

        if (!response.ok) throw await readError(response);
        if (!response.body) throw new Error("Réponse Ollama invalide : flux absent.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let complete = "";

        const processLine = (line) => {
            if (!line.trim()) return false;

            const data = JSON.parse(line);
            if (data.error) throw new Error(`Erreur Ollama : ${data.error}`);
            if (typeof data.response === "string" && data.response) {
                complete += data.response;
                onToken?.(data.response);
            }
            return data.done === true;
        };

        while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value, { stream: !done });

            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";
            for (const line of lines) {
                if (processLine(line)) return complete;
            }

            if (done) {
                if (buffer.trim()) processLine(buffer);
                return complete;
            }
        }
    }
}

export const OllamaService = new Ollama();
