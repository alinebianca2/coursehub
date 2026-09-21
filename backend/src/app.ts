import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { router } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json());

  app.use(router);

  app.use(errorHandler);

  return app;
}
