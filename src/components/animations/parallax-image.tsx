"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Intensidad del desplazamiento en % de la altura. */
  strength?: number;
  /** Revela la imagen con una máscara clip-path al entrar en pantalla. */
  reveal?: boolean;
  imageClassName?: string;
}

/**
 * Imagen con parallax suave (solo escritorio y sin movimiento reducido) y
 * revelado opcional por máscara. El contenedor define el tamaño: sin saltos de layout.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority,
  strength = 10,
  reveal = false,
  imageClassName,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
          if (!motion) return;
          if (reveal) {
            gsap.fromTo(
              ref.current,
              { clipPath: "inset(18% 12% 18% 12%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.8,
                ease: "expo.out",
                scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
              },
            );
          }
          if (desktop) {
            gsap.fromTo(
              inner.current,
              { yPercent: -strength },
              {
                yPercent: strength,
                ease: "none",
                scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div ref={inner} className="absolute inset-x-0 -inset-y-[14%] will-change-transform">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imageClassName)} />
      </div>
    </div>
  );
}
