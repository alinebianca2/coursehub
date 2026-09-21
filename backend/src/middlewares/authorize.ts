import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { Role } from "../types/role";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Token de autenticação não informado"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Você não tem permissão para acessar este recurso"));
    }

    next();
  };
}
