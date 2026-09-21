import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "../types/role";

export interface JwtPayload {
  sub: number;
  role: Role;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado");
  }
  return secret;
}

const ALGORITHM = "HS256";

export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
  return jwt.sign(payload, getSecret(), { expiresIn, algorithm: ALGORITHM });
}

export function verifyToken(token: string): JwtPayload {
  // Restringe explicitamente o algoritmo aceito na verificação para
  // evitar ataques de confusão de algoritmo (ex: token forjado com "alg: none").
  return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] }) as unknown as JwtPayload;
}
