"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { markIntroComplete } from "@/lib/intro";

const SESSION_KEY = "ch:preloaded";

/**
 * Preloader con el monograma CH. Se muestra una vez por sesión y entrega el
 * control a la animación del hero al terminar.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {}

      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        markIntroComplete();
        setDone(true);
      };

      if (seen || prefersReducedMotion()) {
        finish();
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" }, onComplete: finish });
      tl.from("[data-pre-circle]", { scale: 0.6, autoAlpha: 0, duration: 1.1, ease: "expo.out" })
        .from("[data-pre-letter]", { yPercent: 120, duration: 1.1, stagger: 0.12, ease: "expo.out" }, "-=0.8")
        .from("[data-pre-caption]", { autoAlpha: 0, y: 10, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .to("[data-pre-line]", { scaleX: 1, duration: 0.9 }, "-=0.4")
        .to("[data-pre-content]", { autoAlpha: 0, y: -20, duration: 0.6, ease: "power2.in" }, "+=0.15")
        .add(() => markIntroComplete(), "-=0.1")
        .to(ref.current, { yPercent: -100, duration: 1.1 }, "<");
    },
    { scope: ref },
  );

  if (done) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-dark text-background"
      aria-hidden
    >
      <div data-pre-content className="flex flex-col items-center">
        <div className="relative flex size-36 items-center justify-center">
          <span data-pre-circle className="absolute inset-0 rounded-full border border-background/40" />
          <span className="flex overflow-hidden font-display text-[4.5rem] leading-none">
            <span data-pre-letter className="inline-block font-light italic">C</span>
            <span data-pre-letter className="-ml-1 inline-block">H</span>
          </span>
        </div>
        <p data-pre-caption className="eyebrow mt-8 text-background/70">
          Centro Estético · Bogotá
        </p>
        <span data-pre-line className="mt-6 block h-px w-24 origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
