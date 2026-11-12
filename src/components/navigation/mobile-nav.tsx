"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { mainNav } from "@/data/navigation";
import { treatmentCategories } from "@/data/treatments";
import { useLenis } from "@/hooks/use-lenis";
import { site } from "@/lib/site";
import { whatsappFor } from "@/lib/whatsapp";

const ease = [0.16, 1, 0.3, 1] as const;

export function MobileNav({ open, onClose, whatsappPhone }: { open: boolean; onClose: () => void; whatsappPhone: string }) {
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Mantener el foco dentro del menú.
      if (e.key === "Tab" && panel.current) {
        const focusables = panel.current.querySelectorAll<HTMLElement>("a, button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus(), 400);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-nav"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background pt-[var(--header-h)] text-ink lg:hidden"
          data-lenis-prevent
        >
          <nav aria-label="Móvil" className="container-x flex flex-1 flex-col pb-10 pt-6">
            <ul className="border-t hairline">
              {mainNav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease }}
                  className="border-b hairline"
                >
                  <Link href={item.href} onClick={onClose} className="flex items-baseline justify-between py-4">
                    <span className="font-display text-[2.6rem] leading-none tracking-[-0.02em]">{item.label}</span>
                    <span className="font-display text-sm italic text-muted">0{i + 1}</span>
                  </Link>
                  {item.megaMenu && (
                    <ul className="-mt-1 grid grid-cols-2 gap-x-4 gap-y-2 pb-5">
                      {treatmentCategories.map((c) => (
                        <li key={c.slug}>
                          <Link href={c.href} onClick={onClose} className="text-sm text-primary">
                            {c.shortLabel}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-auto flex flex-col gap-6 pt-10"
            >
              <ButtonLink href="/reservar" onClick={onClose} magnetic={false} className="w-full">
                Reservar cita
              </ButtonLink>
              <div className="flex items-center justify-between text-sm text-muted">
                <a href={whatsappFor("general", whatsappPhone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <WhatsappIcon size={16} /> WhatsApp
                </a>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <InstagramIcon size={16} /> Instagram
                </a>
              </div>
              <p className="text-xs text-muted">
                {site.address.street} · {site.address.city}
              </p>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
