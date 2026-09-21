import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // express.json() lança um SyntaxError quando o corpo da requisição
  // não é um JSON válido — é um erro do cliente (400), não do servidor.
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição" });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}
