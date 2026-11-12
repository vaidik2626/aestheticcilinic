import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Monogram } from "@/components/ui/logo";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b hairline bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-10 lg:flex-col lg:items-start">
          <div className="flex items-center gap-3 text-primary-dark">
            <Monogram size={36} />
            <div className="leading-tight">
              <p className="font-display text-lg">Claudia Hernández</p>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Panel</p>
            </div>
          </div>
        </div>
        <AdminNav />
        <div className="mt-4 flex items-center justify-between gap-2 border-t hairline pt-4 text-xs text-muted lg:absolute lg:inset-x-5 lg:bottom-6">
          <span className="truncate" title={admin.email}>{admin.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink">
              <LogOut size={14} aria-hidden /> Salir
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 md:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
