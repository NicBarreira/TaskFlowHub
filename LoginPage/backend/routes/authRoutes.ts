import { Router } from 'express';
import {
  registerUser,
  listUsers,
  loginUser,
  forgotPassword,
  verifyCode,
  resetPassword,
} from '../controllers/authController.js';

export const authRoutes = Router();

authRoutes.post('/usuarios', registerUser);
authRoutes.get('/usuarios', listUsers);
authRoutes.post('/login', loginUser);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/verify-code', verifyCode);
authRoutes.post('/reset-password', resetPassword);

