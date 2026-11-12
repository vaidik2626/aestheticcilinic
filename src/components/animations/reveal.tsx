"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  id?: string;
}

/**
 * Revela el contenedor (o sus hijos marcados con data-reveal-item) al entrar
 * en el viewport. Una sola vez, con transformaciones aceleradas por GPU.
 */
export function Reveal({ children, as: Tag = "div", className, y = 36, stagger = 0.12, delay = 0, start = "top 86%", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const targets = items.length ? Array.from(items) : [el];
      gsap.set(el, { autoAlpha: 1 });
      if (prefersReducedMotion()) {
        gsap.set(targets, { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.3,
          stagger,
          delay,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
