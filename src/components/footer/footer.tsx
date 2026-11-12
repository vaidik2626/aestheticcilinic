"use client";

import Link from "next/link";
import { useRef } from "react";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { Monogram } from "@/components/ui/logo";
import { legalNav, mainNav } from "@/data/navigation";
import { treatmentCategories } from "@/data/treatments";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { mapsDirectionsUrl, site } from "@/lib/site";
import { whatsappFor } from "@/lib/whatsapp";

export function Footer({ whatsappPhone, whatsappDisplay }: { whatsappPhone: string; whatsappDisplay: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-footer-word]", {
        yPercent: 100,
        duration: 1.6,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-footer-wordmark]", start: "top 95%", once: true },
      });
      gsap.from("[data-footer-col]", {
        y: 30,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );

  const year = new Date().getFullYear();

  return (
    <footer ref={ref} className="relative overflow-hidden bg-primary-dark text-background grain">
      <div className="container-x relative pt-24 md:pt-32">
        <div className="grid gap-14 border-b border-background/15 pb-16 md:grid-cols-12">
          <div data-footer-col className="md:col-span-4">
            <Monogram size={56} />
            <p className="mt-8 max-w-xs font-display text-2xl leading-snug text-background/90">
              Tratamientos faciales y corporales, cuidados postoperatorios y asesoramiento estético en Bogotá.
            </p>
          </div>

          <nav data-footer-col aria-label="Pie de página" className="md:col-span-2">
            <p className="eyebrow text-background/50">Navegación</p>
            <ul className="mt-6 space-y-3 text-sm">
              {mainNav.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="link-underline text-background/85 hover:text-background">
                    {i.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/reservar" className="link-underline text-background/85 hover:text-background">
                  Reservar cita
                </Link>
              </li>
            </ul>
          </nav>

          <div data-footer-col className="md:col-span-3">
            <p className="eyebrow text-background/50">Tratamientos</p>
            <ul className="mt-6 space-y-3 text-sm">
              {treatmentCategories.map((c) => (
                <li key={c.slug}>
                  <Link href={c.href} className="link-underline text-background/85 hover:text-background">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-footer-col className="md:col-span-3">
            <p className="eyebrow text-background/50">Visítanos</p>
            <address className="mt-6 space-y-3 text-sm not-italic text-background/85">
              <a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="link-underline block w-fit">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.country}
              </a>
              <a
                href={whatsappFor("general", whatsappPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 pt-2"
              >
                <WhatsappIcon size={15} /> <span className="link-underline">{whatsappDisplay}</span>
              </a>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2">
                <InstagramIcon size={15} /> <span className="link-underline">{site.instagram.handle}</span>
              </a>
            </address>
          </div>
        </div>

        <div data-footer-wordmark className="overflow-hidden py-8 md:py-12" aria-hidden>
          <p className="flex flex-wrap items-baseline gap-x-[0.25em] font-display text-[13.5vw] leading-[0.9] tracking-[-0.04em] text-background/95 3xl:text-[12rem]">
            <span className="inline-block overflow-hidden"><span data-footer-word className="inline-block">Claudia</span></span>
            <span className="inline-block overflow-hidden"><span data-footer-word className="inline-block italic text-accent">Hernández</span></span>
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-background/15 py-8 text-xs text-background/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalNav.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="link-underline hover:text-background">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
