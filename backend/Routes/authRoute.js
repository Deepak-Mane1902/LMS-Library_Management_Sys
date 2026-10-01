import express from 'express'
import { completeProfile, getProfile, getusers, loginUser, registerAdmin, registerUser, updateProfile, verifyOtp } from '../controllers/authController.js';
import { authorizeRoles, authToken } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register',registerUser);
authRouter.post('/verify-otp',verifyOtp);
authRouter.post('/complete-profile',completeProfile);

authRouter.post('/login',loginUser);
authRouter.post('/register-admin',registerAdmin);

// Protected Routes
authRouter.get('/me',authToken, getProfile);
authRouter.get('/users',authToken, authorizeRoles("admin ") ,getusers);

authRouter.put('/update-profile',authToken, updateProfile);

export default authRouter;