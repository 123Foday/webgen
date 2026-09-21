import express from 'express';
import { changePassword, contributions, deleteAccount, login, me, register, resendRegister, updateProfile, verifyRegister } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import forgotRoutes from './authForgot.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/register/verify', verifyRegister);
authRouter.post('/register/resend', resendRegister);
authRouter.post('/login', login);

// to access these routes user must be logged - in
authRouter.get('/me', requireAuth, me);
authRouter.get('/me/contributions', requireAuth, contributions);

authRouter.patch('/me', requireAuth, updateProfile);
authRouter.patch('/me/password', requireAuth, changePassword);
authRouter.delete('/me', requireAuth, deleteAccount);

// for forgot password and reset it
authRouter.use('/forgot', forgotRoutes);

export default authRouter;