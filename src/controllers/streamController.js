import AIManager from "../managers/AIManager.js";
import MemoryManager from "../managers/MemoryManager.js";

export async function streamController(req, res) {
    const { message: bodyMessage, prompt, inputs, model, images } = req.body ?? {};
    const message = bodyMessage ?? prompt ?? (typeof inputs === "string" ? inputs : undefined);
    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Un message est requis." });
    }
    if (model !== undefined && (typeof model !== "string" || !model.trim())) {
        return res.status(400).json({ error: "Le modèle fourni est invalide." });
    }
    if (images !== undefined && (!Array.isArray(images) || images.some((image) => typeof image !== "string"))) {
        return res.status(400).json({ error: "Les images doivent être fournies sous forme de tableau de chaînes." });
    }

    try {
        const uid = req.user.uid;
        const memory = MemoryManager.get(uid);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const fullResponse = await AIManager.stream({
            message,
            memory,
            model,
            images,
            onToken(token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        });

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        MemoryManager.addHistory(uid, { question: message, answer: fullResponse });
    } catch (error) {
        console.error("Erreur du flux IA:", error);
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: error.publicMessage || "Le service IA est indisponible." })}\n\n`);
            return res.end();
        }
        return res.status(502).json({
            error: error.publicMessage || "Le service IA est indisponible."
        });
    }
}