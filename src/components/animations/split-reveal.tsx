"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";

interface SplitRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  start?: string;
  /** "lines" para titulares, "words" para frases cortas con más ritmo. */
  type?: "lines" | "words";
  id?: string;
}

/** Titular que se revela línea a línea desde una máscara al hacer scroll. */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, start = "top 85%", type = "lines", id }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.set(el, { autoAlpha: 1 });
      if (prefersReducedMotion()) return;

      const split = SplitText.create(el, {
        type: type === "lines" ? "lines" : "words,lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "pb-[0.08em] -mb-[0.08em]",
        onSplit(self) {
          return gsap.from(type === "lines" ? self.lines : self.words, {
            yPercent: 115,
            duration: 1.5,
            stagger: type === "lines" ? 0.09 : 0.04,
            delay,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
