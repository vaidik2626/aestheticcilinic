import { ParallaxImage } from "@/components/animations/parallax-image";
import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { TextLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { images } from "@/data/images";
import { treatmentCategories } from "@/data/treatments";

export function Intro({ headline, body }: { headline: string; body: string }) {
  return (
    <section id="bienvenida" aria-labelledby="intro-title" className="relative py-28 md:py-40">
      <div className="container-x">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Reveal>
              <SectionLabel number="—">Bienvenida</SectionLabel>
            </Reveal>
          </div>
          <SplitReveal
            id="intro-title"
            className="display-lg col-span-12 max-w-[16ch] text-primary-dark md:col-span-9 lg:col-span-10"
          >
            {headline}
          </SplitReveal>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-14 md:mt-28">
          <div className="relative col-span-8 col-start-3 md:col-span-4 md:col-start-2 lg:col-span-3 lg:col-start-3">
            <ParallaxImage
              src={images.intro.src}
              alt={images.intro.alt}
              reveal
              strength={8}
              sizes="(min-width: 1024px) 24vw, (min-width: 768px) 34vw, 66vw"
              className="aspect-[3/4] bg-surface"
            />
            <p className="eyebrow mt-4 text-muted">Cuidado consciente</p>
            <span aria-hidden className="absolute -left-6 top-10 hidden h-40 w-px bg-ink/15 md:block" />
          </div>

          <Reveal className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-7 md:pt-24">
            <p data-reveal-item className="lead text-[1.15rem] md:text-[1.25rem] md:leading-[1.75]">
              {body}
            </p>
            <ul data-reveal-item className="mt-12 border-t hairline">
              {treatmentCategories.map((c) => (
                <li key={c.slug} className="flex items-baseline justify-between border-b hairline py-4">
                  <span className="font-display text-xl">{c.label}</span>
                  <span className="font-display text-sm italic text-muted">{c.number}</span>
                </li>
              ))}
            </ul>
            <div data-reveal-item className="mt-10">
              <TextLink href="/sobre-nosotros">Conoce nuestro enfoque</TextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
