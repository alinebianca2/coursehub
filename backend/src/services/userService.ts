import bcrypt from "bcrypt";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/httpError";
import { toPublicUser } from "../utils/userDto";
import { CreateUserInput, UpdateUserInput } from "../validators/userSchemas";

const SALT_ROUNDS = 10;

async function assertEmailAvailable(email: string, ignoreUserId?: number) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && existing.id !== ignoreUserId) {
    throw new HttpError(409, "Já existe um usuário cadastrado com este e-mail");
  }
}

export async function createUser(input: CreateUserInput) {
  await assertEmailAvailable(input.email);

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  return toPublicUser(user);
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return users.map(toPublicUser);
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new HttpError(404, "Usuário não encontrado");
  }

  return toPublicUser(user);
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new HttpError(404, "Usuário não encontrado");
  }

  if (input.email && input.email !== existing.email) {
    await assertEmailAvailable(input.email, id);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      passwordHash: input.password ? await bcrypt.hash(input.password, SALT_ROUNDS) : undefined,
    },
  });

  return toPublicUser(user);
}

export async function deleteUser(id: number) {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new HttpError(404, "Usuário não encontrado");
  }

  await prisma.user.delete({ where: { id } });
}
