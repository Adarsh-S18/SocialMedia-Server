import express from 'express'
import { addMessage, getMessage, getUnreadCount } from '../Controllers/MessageController.js';

const router = express.Router()

router.post("/", addMessage);

router.get("/unread/:conversationId",getUnreadCount)

router.get("/:conversationId", getMessage);

export default router
