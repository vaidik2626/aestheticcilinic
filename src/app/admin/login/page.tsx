import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/login-form";
import { Monogram } from "@/components/ui/logo";
import { getAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/prisma";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (isDatabaseConfigured() && (await getAdmin())) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center text-primary-dark">
          <Monogram size={56} />
          <h1 className="mt-6 font-display text-3xl">Administración</h1>
          <p className="mt-2 text-sm text-muted">Centro Estético Claudia Hernández</p>
        </div>
        <div className="mt-10 border hairline bg-white p-8">
          {isDatabaseConfigured() ? (
            <LoginForm />
          ) : (
            <p className="text-sm text-[#a24a3a]">
              La base de datos no está configurada. Define <code>DATABASE_URL</code> y crea un administrador con <code>npm run admin:create</code>.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
