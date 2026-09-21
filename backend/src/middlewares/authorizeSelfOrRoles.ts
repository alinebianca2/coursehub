import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { Role } from "../types/role";

// Libera o acesso se o perfil autenticado estiver em `roles` (ex: ADMIN,
// OPERATOR) OU se o :id da rota for o próprio usuário autenticado — regra
// de ownership exigida para CLIENT em GET /users/:id.
export function authorizeSelfOrRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Token de autenticação não informado"));
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    const requestedId = Number(req.params.id);

    if (req.user.id === requestedId) {
      return next();
    }

    return next(new HttpError(403, "Você não tem permissão para acessar este recurso"));
  };
}
