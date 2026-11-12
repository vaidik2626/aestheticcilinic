"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TextLink } from "@/components/ui/button";
import { treatmentCategories } from "@/data/treatments";

interface MegaMenuProps {
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}

export function MegaMenu({ onEnter, onLeave, onNavigate }: MegaMenuProps) {
  const [hovered, setHovered] = useState(0);
  const current = treatmentCategories[hovered];

  return (
    <motion.div
      id="mega-menu"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full hidden border-b hairline bg-background text-ink shadow-[0_30px_60px_-30px_rgba(60,48,42,0.25)] lg:block"
    >
      <div className="container-x grid grid-cols-12 gap-10 py-12">
        <div className="col-span-3 flex flex-col justify-between">
          <div>
            <p className="eyebrow text-primary">Tratamientos</p>
            <p className="mt-5 font-display text-3xl leading-tight">
              Experiencias diseñadas <em className="text-primary">para ti.</em>
            </p>
          </div>
          <TextLink href="/tratamientos" className="mt-8">
            Ver todos
          </TextLink>
        </div>

        <ul className="col-span-5 border-t hairline">
          {treatmentCategories.map((c, i) => (
            <li key={c.slug} className="border-b hairline">
              <Link
                href={c.href}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onClick={onNavigate}
                className="group flex items-baseline gap-5 py-5"
              >
                <span className="font-display text-sm italic text-muted">{c.number}</span>
                <span className="flex-1">
                  <span className="block font-display text-[1.75rem] leading-none transition-transform duration-700 ease-expo group-hover:translate-x-2">
                    {c.label}
                  </span>
                  <span className="mt-2 block max-w-sm text-[0.8rem] leading-relaxed text-muted">{c.tagline}</span>
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.3}
                  className="text-primary opacity-0 transition-all duration-500 ease-expo group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative col-span-4 aspect-[4/5] max-h-[22rem] w-full overflow-hidden bg-surface">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image src={current.image.src} alt={current.image.alt} fill sizes="30vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-sm leading-relaxed text-background">{current.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
