import express from 'express';
import { createMessage, getMessageUserId, getMessages } from '../controllers/chatController.js';

const router = express.Router();

router.post("/create", createMessage);

router.get("/:userId", getMessageUserId);
router.get("/", getMessages);

export default router;
