import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Monograma tipográfico "CH" creado para este sitio. No es el logotipo oficial
 * del centro: sustitúyelo por el archivo original cuando esté disponible.
 */
export function Monogram({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Monograma CH"
    >
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <text
        x="25.5"
        y="41.5"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontSize="30"
        fontStyle="italic"
        fontWeight="300"
        fill="currentColor"
      >
        C
      </text>
      <text
        x="37.5"
        y="41.5"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontSize="30"
        fontWeight="400"
        fill="currentColor"
      >
        H
      </text>
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="Centro Estético Claudia Hernández — Inicio">
      <Monogram className="transition-transform duration-700 ease-expo group-hover:rotate-[-8deg]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.35rem] tracking-[-0.01em]">Claudia Hernández</span>
          <span className="eyebrow mt-1 !text-[0.56rem] !tracking-[0.34em] opacity-70">Centro Estético</span>
        </span>
      )}
    </Link>
  );
}
