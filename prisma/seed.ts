import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.profile.findFirst({ where: { login: "admin" } });
  if (existing) {
    console.log("Admin já existe. Seed ignorado.");
    return;
  }

  const password_hash = await bcrypt.hash("admin123456789", 12);

  const admin = await prisma.profile.create({
    data: {
      nome: "Jarl Admin",
      login: "admin",
      email: "admin@heimdall.local",
      password_hash,
      role: "admin",
      classe_viking: "Berserker Backend",
      papel: "Líder Técnico",
    },
  });

  console.log(`✅ Admin criado: login=admin  id=${admin.id}`);
  console.log(`   Senha padrão: admin123456789  ← TROQUE IMEDIATAMENTE!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
