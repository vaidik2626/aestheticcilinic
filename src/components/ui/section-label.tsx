import { cn } from "@/lib/utils";

export function SectionLabel({
  number,
  children,
  className,
  light = false,
}: {
  number?: string;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-4", light ? "text-background/75" : "text-primary", className)}>
      {number && <span className="font-display text-sm italic tracking-normal normal-case">{number}</span>}
      <span aria-hidden className={cn("h-px w-10", light ? "bg-background/40" : "bg-primary/40")} />
      <span>{children}</span>
    </p>
  );
}

/** Aviso discreto para contenido pendiente de validar por el centro. */
export function PlaceholderNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 border border-dashed border-accent/60 px-3 py-1.5 text-[0.7rem] tracking-wide text-muted", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}
