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

export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as unknown as JwtPayload;
}
