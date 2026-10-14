
import express from "express";
import { chatController } from "../controllers/chatController.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";

const router = express.Router();

router.post("/", firebaseAuth, chatController);

export default router;