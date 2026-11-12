"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "@/hooks/use-lenis";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { PublicGalleryImage } from "@/lib/data";

const aspects = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[4/5]", "aspect-[5/4]", "aspect-[3/4]"];
const isRemote = (src: string) => /^https?:\/\//.test(src);

export function Gallery({ items }: { items: PublicGalleryImage[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 1 });
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-gallery-item]", root.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo.inOut",
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          },
        );
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  return (
    <>
      <div ref={root} data-reveal className="columns-2 gap-3 sm:gap-6 lg:columns-3">
        {items.map((img, i) => (
          <button
            key={img.id}
            type="button"
            data-gallery-item
            data-cursor="Ver"
            onClick={() => setOpen(i)}
            aria-label={`Ampliar imagen: ${img.alt}`}
            className={`group img-zoom relative mb-3 block w-full break-inside-avoid overflow-hidden bg-surface-dark sm:mb-6 ${aspects[i % aspects.length]}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 32vw, 50vw"
              unoptimized={isRemote(img.src)}
              className="object-cover"
            />
            <span className="absolute inset-0 bg-primary-dark/0 transition-colors duration-700 group-hover:bg-primary-dark/20" aria-hidden />
            {img.label && (
              <span className="eyebrow absolute bottom-3 left-3 text-background opacity-90 sm:bottom-5 sm:left-5 lg:translate-y-2 lg:opacity-0 lg:transition-all lg:duration-500 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                {img.label}
              </span>
            )}
            <span
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/85 text-ink lg:hidden"
              aria-hidden
            >
              <Plus size={14} strokeWidth={1.5} />
            </span>
          </button>
        ))}
      </div>

      <Lightbox items={items} index={open} onChange={setOpen} />
    </>
  );
}

function Lightbox({ items, index, onChange }: { items: PublicGalleryImage[]; index: number | null; onChange: (i: number | null) => void }) {
  const lenis = useLenis();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    lenis?.stop();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      trigger?.focus?.();
    };
  }, [isOpen, go, lenis, onChange]);

  const img = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {img && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Galería ampliada"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-primary-dark/95 p-4 backdrop-blur-sm md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onChange(null)}
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={img.id}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full max-w-5xl flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1">
                <Image src={img.src} alt={img.alt} fill sizes="90vw" unoptimized={isRemote(img.src)} className="object-contain" />
              </div>
              <figcaption className="mt-4 flex items-center justify-between text-sm text-background/80">
                <span>{img.label || img.alt}</span>
                <span className="font-display italic">
                  {String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <button
            ref={closeBtn}
            type="button"
            aria-label="Cerrar galería"
            onClick={() => onChange(null)}
            className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background hover:text-primary-dark md:right-8 md:top-8"
          >
            <X size={18} strokeWidth={1.4} />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background hover:text-primary-dark md:left-8"
              >
                <ChevronLeft size={18} strokeWidth={1.4} />
              </button>
              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background hover:text-primary-dark md:right-8"
              >
                <ChevronRight size={18} strokeWidth={1.4} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
