import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

type Role = "ADMIN" | "OPERATOR" | "CLIENT";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@123";
const SALT_ROUNDS = 10;

async function upsertUser(name: string, email: string, role: Role) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role },
  });
}

async function main() {
  await upsertUser("Administrador", "admin@coursehub.com", "ADMIN");
  await upsertUser("Operador", "operator@coursehub.com", "OPERATOR");
  await upsertUser("Cliente", "client@coursehub.com", "CLIENT");

  console.log("Seed concluído. Senha de demonstração para os 3 usuários:", DEMO_PASSWORD);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
