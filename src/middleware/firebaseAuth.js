
import "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";

export async function firebaseAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Token manquant"
            });
        }
        const decoded = await getAuth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Utilisateur non authentifié"
        });
    }
}