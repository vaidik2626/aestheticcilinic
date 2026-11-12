"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MegaMenu } from "@/components/navigation/mega-menu";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { mainNav } from "@/data/navigation";
import { treatmentCategories } from "@/data/treatments";
import { cn } from "@/lib/utils";

function activeKeyFor(pathname: string, homeSection: string) {
  if (pathname === "/") return homeSection;
  if (pathname.startsWith("/tratamientos") || treatmentCategories.some((c) => pathname.startsWith(c.href))) return "tratamientos";
  if (pathname.startsWith("/sobre-nosotros")) return "sobre-nosotros";
  if (pathname.startsWith("/nuestra-experiencia")) return "experiencia";
  if (pathname.startsWith("/contacto")) return "contacto";
  return "";
}

export function Header({ whatsappPhone }: { whatsappPhone: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [darkHero, setDarkHero] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [homeSection, setHomeSection] = useState("inicio");
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar menús en cada cambio de página.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  // Detectar si la página nueva tiene un hero oscuro (cabecera en texto claro).
  useEffect(() => {
    const id = requestAnimationFrame(() => setDarkHero(Boolean(document.querySelector('[data-header-theme="dark"]'))));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Indicador de sección activa en el inicio.
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = mainNav.map((n) => n.sectionId).filter(Boolean) as string[];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setHomeSection(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  const openMega = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 160);
  }, []);

  const activeKey = activeKeyFor(pathname, homeSection);
  const solid = scrolled || megaOpen;
  const light = darkHero && !solid && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 transition-[background-color,color,height,border-color,backdrop-filter] duration-700 ease-expo",
          mobileOpen ? "z-[70]" : "z-50",
          solid ? "h-[4.5rem] border-b hairline bg-background/92 backdrop-blur-md" : "h-[var(--header-h)] border-b border-transparent bg-transparent",
          light ? "text-background" : "text-ink",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <Logo className="relative z-10" />

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active = activeKey === item.sectionId;
                return (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={item.megaMenu ? openMega : () => setMegaOpen(false)}
                  >
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="relative px-3.5 py-2 text-[0.8rem] font-medium tracking-[0.04em]"
                        onFocus={item.megaMenu ? undefined : () => setMegaOpen(false)}
                      >
                        <span className="link-underline" data-active={active}>
                          {item.label}
                        </span>
                      </Link>
                      {item.megaMenu && (
                        <button
                          type="button"
                          aria-label="Mostrar tratamientos"
                          aria-expanded={megaOpen}
                          aria-controls="mega-menu"
                          onClick={() => setMegaOpen((v) => !v)}
                          className="-ml-2 p-1.5"
                        >
                          <ChevronDown size={14} strokeWidth={1.5} className={cn("transition-transform duration-500", megaOpen && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ButtonLink
              href="/reservar"
              variant={light ? "light" : "primary"}
              className="hidden !px-6 !py-3 sm:inline-flex"
            >
              Reservar cita
            </ButtonLink>
            <button
              type="button"
              className="relative z-[70] flex size-11 items-center justify-center lg:hidden"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="relative block h-3 w-7">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-expo",
                    mobileOpen && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-px bg-current transition-all duration-500 ease-expo",
                    mobileOpen ? "w-full -translate-y-1.5 -rotate-45" : "w-4/6",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && <MegaMenu onEnter={openMega} onLeave={scheduleClose} onNavigate={() => setMegaOpen(false)} />}
        </AnimatePresence>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} whatsappPhone={whatsappPhone} />
    </>
  );
}
