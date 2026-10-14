
import chatRoutes from "./routes/chatRoutes.js";

app.use("/api/chat", chatRoutes);

export function detectMode(message) {
    const msg = message.toLowerCase();
    if (msg.includes("anglais")) return "english_teacher";
    if (msg.includes("portugais")) return "portuguese_teacher";
    if (msg.includes("code") || msg.includes("react")) return "developer";
    return "normal";
}