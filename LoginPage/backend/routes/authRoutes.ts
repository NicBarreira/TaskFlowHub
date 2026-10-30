import { Router } from 'express';
import { registerUser, listUsers, loginUser } from '../controllers/authController.js';

export const authRoutes = Router();

authRoutes.post('/usuarios', registerUser);
authRoutes.get('/usuarios', listUsers);
authRoutes.get('/Usuarios', listUsers);
authRoutes.post('/login', loginUser);
