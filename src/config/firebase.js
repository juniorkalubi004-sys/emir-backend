import { cert, initializeApp } from "firebase-admin/app";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env")
});

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
    throw new Error("La variable FIREBASE_SERVICE_ACCOUNT est requise.");
}

let serviceAccount;

try {
    serviceAccount = JSON.parse(serviceAccountJson);
} catch {
    throw new Error("La variable FIREBASE_SERVICE_ACCOUNT doit contenir un JSON valide.");
}

const app = initializeApp({
    credential: cert(serviceAccount)
});

export default app;