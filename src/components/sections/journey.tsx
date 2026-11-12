"use client";

import Image from "next/image";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { images } from "@/data/images";
import { gsap, useGSAP } from "@/lib/gsap";

const steps = [
  { title: "Llegada", body: "Un espacio tranquilo te recibe. Sin prisas, a tu ritmo.", image: images.interiorSpa },
  { title: "Conversación", body: "Escuchamos lo que buscas y resolvemos tus primeras dudas.", image: images.consult },
  { title: "Valoración", body: "Revisamos tu caso para proponerte solo lo adecuado para ti.", image: images.facialHands },
  { title: "Tratamiento", body: "Vives tu sesión con atención constante y cuidado en cada gesto.", image: images.body },
  { title: "Seguimiento", body: "Te acompañamos después, con recomendaciones claras.", image: images.product },
];

/**
 * Recorrido de la experiencia en scroll horizontal fijado (escritorio).
 * En móvil y con movimiento reducido se presenta como lista vertical.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-journey-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-journey-stage]",
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.to("[data-journey-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-journey-stage]", start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-journey-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.2 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="journey-title" className="relative bg-primary-dark text-background">
      <div data-journey-stage className="relative overflow-hidden lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
        <div className="container-x flex items-end justify-between gap-6 pt-24 lg:pt-0">
          <div>
            <SectionLabel light>El recorrido</SectionLabel>
            <h2 id="journey-title" className="display-md mt-6 max-w-[14ch]">
              Así es tu visita, <em className="font-light text-accent">paso a paso.</em>
            </h2>
          </div>
          <div className="hidden w-48 lg:block" aria-hidden>
            <div className="h-px w-full bg-background/20">
              <div data-journey-progress className="h-px w-full origin-left scale-x-0 bg-accent" />
            </div>
          </div>
        </div>

        <ol data-journey-track className="mt-14 flex flex-col gap-14 px-[var(--gutter)] pb-24 lg:mt-16 lg:w-max lg:flex-row lg:gap-10 lg:pb-0 lg:pr-[30vw]">
          {steps.map((s, i) => (
            <li key={s.title} className="lg:w-[30vw] lg:max-w-[28rem] lg:shrink-0">
              <div className={`relative aspect-[4/5] overflow-hidden bg-primary ${i % 2 === 1 ? "lg:mt-16" : ""}`}>
                <div data-journey-img className="absolute inset-0">
                  <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                </div>
              </div>
              <div className="mt-6 flex gap-5 border-t border-background/20 pt-5">
                <span className="font-display text-3xl italic leading-none text-accent">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[1.9rem] leading-none">{s.title}</h3>
                  <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-background/70">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
