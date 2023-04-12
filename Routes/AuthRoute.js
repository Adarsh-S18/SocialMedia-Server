import express from 'express'
import { adminLogin, loginUser, registerUser, saveVerifiedEmail } from '../Controllers/AuthController.js'

const router = express.Router()


router.post('/register', registerUser)

router.post('/login',loginUser);

router.post("/admin-login",adminLogin);

router.get("/verify/:token" , saveVerifiedEmail)



export default router