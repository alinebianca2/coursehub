import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";

export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/users", authenticate, userRoutes);
