"use client";

import { CalendarDays, Clock, ExternalLink, FileText, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/tratamientos", label: "Tratamientos", icon: Sparkles },
  { href: "/admin/disponibilidad", label: "Disponibilidad", icon: Clock },
  { href: "/admin/contenido", label: "Contenido", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administración" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
              active ? "bg-primary-dark text-background" : "text-ink/75 hover:bg-surface",
            )}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted hover:bg-surface lg:mt-6">
        <ExternalLink size={16} strokeWidth={1.5} aria-hidden />
        Ver sitio
      </Link>
    </nav>
  );
}
