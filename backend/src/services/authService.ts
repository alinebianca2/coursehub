import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/httpError";
import { signToken } from "../utils/jwt";
import { toPublicUser } from "../utils/userDto";
import { Role } from "../types/role";
import { LoginInput } from "../validators/authSchemas";

const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos";

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new HttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const token = signToken({ sub: user.id, role: user.role as Role });

  return { token, user: toPublicUser(user) };
}
