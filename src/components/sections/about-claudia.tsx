import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { FounderPortrait } from "@/components/sections/founder-portrait";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { isPlaceholder, type SiteContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export function EditableText({ text, className }: { text: string; className?: string }) {
  const pending = isPlaceholder(text);
  return (
    <p className={cn(className, pending && "border-l-2 border-dashed border-accent/60 pl-4 italic text-muted")}>{text}</p>
  );
}

export function AboutClaudia({ about }: { about: SiteContent["about"] }) {
  const blocks = [
    { label: "Su historia", text: about.introduction },
    { label: "Trayectoria", text: about.background },
    { label: "Filosofía", text: about.philosophy },
    { label: "Atención personalizada", text: about.approach },
  ];

  return (
    <section id="sobre-nosotros" aria-labelledby="about-title" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-16">
        <div className="relative col-span-12 md:col-span-6 lg:col-span-5">
          <Reveal>
            <FounderPortrait src={about.portraitSrc || undefined} className="aspect-[4/5] w-full" />
          </Reveal>
          <p aria-hidden className="absolute -right-4 top-1/2 hidden origin-center translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap eyebrow text-muted lg:block">
            Fundadora · Claudia Hernández
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-7">
          <Reveal>
            <SectionLabel number="03">Sobre Claudia</SectionLabel>
          </Reveal>
          <SplitReveal id="about-title" className="display-lg mt-8 max-w-[12ch] text-primary-dark">
            Un espacio pensado para cuidarte.
          </SplitReveal>

          <Reveal className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2" stagger={0.1}>
            {blocks.map((b) => (
              <div key={b.label} data-reveal-item className="border-t hairline pt-5">
                <p className="eyebrow text-primary">{b.label}</p>
                <EditableText text={b.text} className="mt-4 text-[0.95rem] leading-relaxed text-ink/75" />
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-14">
            <ButtonLink href="/nuestra-experiencia" variant="outline">
              Conoce nuestro espacio
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
