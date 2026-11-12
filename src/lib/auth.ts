import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const COOKIE = "ch_admin_session";
const SESSION_HOURS = 12;
// Hash ficticio para igualar el tiempo de respuesta cuando el usuario no existe.
const DUMMY_HASH = "$2b$12$9UeOgaGN7ymk41j0y9jV/e9uVZxY.PvsacJ3IiF2EfAjJmwBhX5fO";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  return ok && user ? user : null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000);
  await prisma.adminSession.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  // Limpieza oportunista de sesiones caducadas.
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(COOKIE);
}

/** Usuario administrador de la petición actual, o null. Verificado contra la base de datos. */
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch (error) {
    console.error("[auth] no se pudo verificar la sesión:", error instanceof Error ? error.message : error);
    return null;
  }
});

/** Autorización obligatoria para páginas, server actions y rutas del panel. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
