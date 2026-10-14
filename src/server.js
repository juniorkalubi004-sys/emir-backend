import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import AIManager from "./managers/AIManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
AIManager.setProvider(process.env.AI_PROVIDER || "ollama");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/chat", chatRoutes)
app.use("/api/chat/stream", streamRoutes);

//LE FICHIER PRINCIPAL 
app.get("/", (req, res) => {
    res.json({
        name: "ÉMIR AI",
        version: "1.0.0",
        status: "running"
    });
});


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT} `);
});