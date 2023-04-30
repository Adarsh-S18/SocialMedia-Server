import express from 'express'
import { getConv, getConvIncTwo, newConversation } from '../Controllers/ConversationController.js';

const router = express.Router()

router.post("/", newConversation);

router.get("/:userId", getConv);

router.get("/find/:firstUserId/:secondUserId", getConvIncTwo);



// router.post("/markasread", updateRead)

export default router
