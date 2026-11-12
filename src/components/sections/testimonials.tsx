"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/animations/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { categoryByKey } from "@/data/treatments";
import type { PublicTestimonial } from "@/lib/data";

/**
 * Slider de testimonios. Solo muestra testimonios reales publicados con
 * autorización; si no hay ninguno, muestra un marcador claramente identificado.
 */
export function Testimonials({ items }: { items: PublicTestimonial[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const hasReal = items.length > 0;
  const total = items.length;

  const paginate = (d: 1 | -1) => setState(([i]) => [(i + d + total) % total, d]);
  const current = hasReal ? items[index] : null;

  return (
    <section aria-labelledby="testimonials-title" className="relative overflow-hidden bg-surface py-28 md:py-36">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12">
        <Reveal className="col-span-12 lg:col-span-3">
          <div data-reveal-item>
            <SectionLabel number="06">Testimonios</SectionLabel>
          </div>
          <h2 data-reveal-item id="testimonials-title" className="display-md mt-8 max-w-[10ch] text-primary-dark">
            En sus <em className="font-light text-primary">palabras.</em>
          </h2>
        </Reveal>

        <div className="relative col-span-12 lg:col-span-8 lg:col-start-5">
          <span aria-hidden className="pointer-events-none absolute -left-2 -top-16 select-none font-display text-[12rem] leading-none text-primary/15 md:-top-24 md:text-[16rem]">
            “
          </span>

          {hasReal && current ? (
            <div className="relative min-h-[18rem]" aria-live="polite">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.figure
                  key={current.id}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <blockquote className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.2] text-primary-dark">
                    {current.text}
                  </blockquote>
                  <figcaption className="mt-10 flex items-center gap-4 text-sm">
                    <span className="h-px w-10 bg-primary/40" aria-hidden />
                    <span className="font-semibold">{current.firstName}</span>
                    {current.category && <span className="text-muted">· {categoryByKey[current.category].label}</span>}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          ) : (
            <Reveal>
              <figure className="relative">
                <p className="eyebrow mb-6 inline-flex items-center gap-2 border border-dashed border-accent/70 px-3 py-1.5 !text-[0.62rem] text-muted">
                  Contenido de demostración
                </p>
                <blockquote className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.2] text-primary-dark/45">
                  Aquí se publicarán las experiencias reales de nuestras clientas, siempre con su autorización expresa.
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4 text-sm text-muted">
                  <span className="h-px w-10 bg-primary/30" aria-hidden />
                  Nombre de la clienta · Tratamiento
                </figcaption>
              </figure>
            </Reveal>
          )}

          {total > 1 && (
            <div className="mt-14 flex items-center justify-between border-t hairline pt-6">
              <span className="font-display text-lg italic text-muted">
                {String(index + 1).padStart(2, "0")} — {String(total).padStart(2, "0")}
              </span>
              <div className="flex gap-3">
                {([-1, 1] as const).map((d) => (
                  <motion.button
                    key={d}
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => paginate(d)}
                    aria-label={d === -1 ? "Testimonio anterior" : "Testimonio siguiente"}
                    className="flex size-12 items-center justify-center rounded-full border hairline transition-colors hover:border-primary-dark hover:bg-primary-dark hover:text-background"
                  >
                    {d === -1 ? <ArrowLeft size={16} strokeWidth={1.4} /> : <ArrowRight size={16} strokeWidth={1.4} />}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
