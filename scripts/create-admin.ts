/**
 * Crea o actualiza la cuenta de administración. No existe registro público.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
 *
 * La contraseña debe tener al menos 12 caracteres. Se guarda con bcrypt (coste 12).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("✗ Define ADMIN_EMAIL con un correo válido.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("✗ ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email: email! },
    update: { passwordHash },
    create: { email: email!, passwordHash },
  });
  // Cerrar sesiones previas al cambiar la contraseña.
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });
  console.log(`✓ Administrador listo: ${user.email}`);
  console.log("  Recuerda eliminar ADMIN_PASSWORD de tus variables de entorno.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
