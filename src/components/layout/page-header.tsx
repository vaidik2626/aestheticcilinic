import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  crumbs?: { label: string; href: string }[];
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, lead, crumbs = [], className, children }: PageHeaderProps) {
  return (
    <section className={cn("relative pb-16 pt-[calc(var(--header-h)+4rem)] md:pb-24 md:pt-[calc(var(--header-h)+6rem)]", className)}>
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-9">
          <Reveal className="eyebrow flex flex-wrap items-center gap-2 text-muted" y={12}>
            <nav aria-label="Ruta de navegación" className="flex gap-2">
              <Link href="/" className="link-underline">Inicio</Link>
              {crumbs.map((c) => (
                <span key={c.href} className="flex gap-2">
                  <span aria-hidden>/</span>
                  <Link href={c.href} className="link-underline">{c.label}</Link>
                </span>
              ))}
            </nav>
            <span aria-hidden className="mx-3 h-px w-8 bg-ink/20" />
            <span className="text-primary">{eyebrow}</span>
          </Reveal>
          <SplitReveal as="h1" className="display-xl mt-8 max-w-[14ch] text-primary-dark" start="top 95%">
            {title}
          </SplitReveal>
        </div>
        {(lead || children) && (
          <Reveal className="col-span-12 flex flex-col justify-end gap-8 lg:col-span-3" delay={0.3}>
            {lead && <p className="lead">{lead}</p>}
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
