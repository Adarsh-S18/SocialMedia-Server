import express from 'express'
import { getNotification ,setNotification } from '../Controllers/NotificationController.js'

const router = express.Router()

router.get('/:id',getNotification)

router.put("/:id",setNotification)

export default router;