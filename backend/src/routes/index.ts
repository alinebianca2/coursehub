import { Router } from "express";
import { authRoutes } from "./authRoutes";

export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
