import { Router } from "express";
import { loginController } from "../controllers/authController";
import { authenticate } from "../middlewares/authenticate";

export const authRoutes = Router();

authRoutes.post("/login", loginController);

// Rota simples para validar o middleware de autenticação (Etapa 3).
authRoutes.get("/me", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});
