import express from "express";
import { streamController } from "../controllers/streamController.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";

const router = express.Router();

router.post("/", firebaseAuth, streamController);

export default router;