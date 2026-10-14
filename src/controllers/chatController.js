import AIManager from "../managers/AIManager.js";
import MemoryManager from "../managers/MemoryManager.js";

export async function chatController(req, res) {
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
        const reply = await AIManager.chat({ message, memory, model, images });

        MemoryManager.addHistory(uid, { question: message, answer: reply });
        return res.json({ reply });
    } catch (error) {
        console.error("Erreur du chat IA:", error);
        return res.status(502).json({
            error: error.publicMessage || "Le service IA est indisponible."
        });
    }
}