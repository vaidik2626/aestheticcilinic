import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Retrato de Claudia. Mientras no exista una fotografía autorizada se muestra
 * un marcador de posición diseñado (nunca una foto de archivo haciéndose pasar por ella).
 */
export function FounderPortrait({ src, className }: { src?: string; className?: string }) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-dark", className)}>
        <Image src={src} alt="Retrato de Claudia Hernández" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden bg-surface-dark text-primary", className)}
      role="img"
      aria-label="Espacio reservado para el retrato de Claudia Hernández"
    >
      <div className="absolute inset-6 border border-primary/20" aria-hidden />
      <div className="absolute inset-x-0 top-1/2 h-px bg-primary/10" aria-hidden />
      <span
        aria-hidden
        className="select-none font-display text-[clamp(8rem,20vw,16rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--primary)] opacity-50"
      >
        <i className="font-light">C</i>H
      </span>
      <p className="eyebrow absolute bottom-10 left-1/2 w-max -translate-x-1/2 text-center text-primary/70">
        Retrato de Claudia · Imagen pendiente
      </p>
    </div>
  );
}
