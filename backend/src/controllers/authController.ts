import { NextFunction, Request, Response } from "express";
import { login } from "../services/authService";
import { loginSchema } from "../validators/authSchemas";

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
