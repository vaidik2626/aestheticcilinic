"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { treatmentCategories } from "@/data/treatments";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Cuatro experiencias de tratamiento como índice editorial interactivo:
 * en escritorio, una imagen fija cambia según la fila activa (scroll o hover);
 * en móvil, cada experiencia muestra su propia fotografía.
 */
export function TreatmentExperience() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const current = treatmentCategories[active];

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-tx-row]");
      gsap.set("[data-reveal]", { autoAlpha: 1 });

      if (!prefersReducedMotion()) {
        rows.forEach((row) => {
          gsap.from(row.querySelectorAll("[data-tx-anim]"), {
            y: 50,
            autoAlpha: 0,
            duration: 1.3,
            stagger: 0.08,
            scrollTrigger: { trigger: row, start: "top 85%", once: true },
          });
          gsap.from(row.querySelector("[data-tx-line]"), {
            scaleX: 0,
            transformOrigin: "left",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: row, start: "top 90%", once: true },
          });
        });
      }

      // Activar la fila centrada en pantalla (solo escritorio).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        rows.forEach((row, i) =>
          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => self.isActive && setActive(i),
          }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="tratamientos" aria-labelledby="tx-title" className="relative bg-surface py-28 md:py-40">
      <div className="container-x">
        <div data-reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <SectionLabel number="01">Experiencias</SectionLabel>
            <h2 id="tx-title" className="display-lg mt-8 max-w-[14ch] text-primary-dark">
              Cuatro caminos hacia <em className="font-light text-primary">tu bienestar.</em>
            </h2>
          </div>
          <p className="lead max-w-sm">
            Cada experiencia comienza con una valoración personalizada. Elige por dónde empezar.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-x-6 md:mt-28">
          {/* Imagen fija (escritorio) */}
          <div className="relative col-span-5 hidden lg:block">
            <div className="sticky top-28 aspect-[4/5] w-full overflow-hidden bg-surface-dark">
              {/* Precarga de las cuatro imágenes para que el cambio sea instantáneo. */}
              <div className="invisible absolute inset-0" aria-hidden>
                {treatmentCategories.map((c) => (
                  <Image key={c.slug} src={c.image.src} alt="" fill sizes="40vw" loading="eager" className="object-cover" />
                ))}
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0.999 }}
                  transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.18 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Image src={current.image.src} alt={current.image.alt} fill sizes="40vw" className="object-cover" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-primary-dark/55 to-transparent p-6 pt-24 text-background">
                <span className="font-display text-6xl italic leading-none">{current.number}</span>
                <span className="eyebrow">{current.tagline}</span>
              </div>
            </div>
          </div>

          {/* Índice de experiencias */}
          <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
            {treatmentCategories.map((c, i) => (
              <li key={c.slug} data-tx-row className="relative">
                <span data-tx-line aria-hidden className="absolute inset-x-0 top-0 h-px bg-ink/15" />
                <Link
                  href={c.href}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  data-cursor="Descubrir"
                  className="group block py-10 md:py-14"
                >
                  {/* Imagen en móvil/tablet */}
                  <div data-tx-anim className="img-zoom relative mb-8 aspect-[4/3] overflow-hidden bg-surface-dark lg:hidden">
                    <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 90vw, 100vw" className="object-cover" />
                  </div>

                  <div className="flex items-start gap-6 md:gap-10">
                    <span data-tx-anim className="font-display pt-3 text-lg italic text-muted">
                      {c.number}
                    </span>
                    <div className="flex-1">
                      <p data-tx-anim className="eyebrow text-primary/80">
                        {c.tagline}
                      </p>
                      <h3
                        data-tx-anim
                        className={`mt-4 font-display text-[clamp(2.25rem,4.2vw,4rem)] leading-[1] tracking-[-0.02em] transition-colors duration-700 ${
                          active === i ? "lg:text-primary-dark" : "lg:text-ink/45"
                        }`}
                      >
                        {/* El desplazamiento en hover vive en un span: GSAP anima el h3 sin conflicto de transiciones. */}
                        <span className="inline-block transition-transform duration-700 ease-expo group-hover:translate-x-3">{c.label}</span>
                      </h3>
                      <p data-tx-anim className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink/70">
                        {c.summary}
                      </p>
                      <span
                        data-tx-anim
                        className="mt-7 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-dark"
                      >
                        <span className="link-underline link-underline-static">Descubrir</span>
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.5}
                          className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            <li aria-hidden className="h-px bg-ink/15" />
          </ol>
        </div>
      </div>
    </section>
  );
}
