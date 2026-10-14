import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

const apiKey = process.env.OPENAI_API_KEY ;
if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant. Vérifiez le fichier .env dans le dossier backend.");
}

const openai = new OpenAI({ apiKey });
export default openai;