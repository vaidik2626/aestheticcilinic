import { Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ParallaxImage } from "@/components/animations/parallax-image";
import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { BookingCta } from "@/components/sections/booking-cta";
import { Faq } from "@/components/treatments/faq";
import { RelatedExperiences } from "@/components/treatments/related";
import { TreatmentHero, type HeroVariant } from "@/components/treatments/treatment-hero";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionLabel } from "@/components/ui/section-label";
import type { TreatmentCategoryContent } from "@/data/treatments";
import { getBookingCatalog, getSiteContent } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface TreatmentLayout {
  hero: HeroVariant;
  information: "split" | "columns";
  process: "timeline" | "sticky";
  /** Muestra el aviso de idoneidad antes de la información (postoperatorios). */
  suitabilityFirst?: boolean;
}

function Introduction({ c }: { c: TreatmentCategoryContent }) {
  return (
    <section aria-labelledby="t-intro" className="py-24 md:py-36">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
        <Reveal className="col-span-12 md:col-span-3">
          <SectionLabel number={c.number}>{c.tagline}</SectionLabel>
        </Reveal>
        <div className="col-span-12 md:col-span-9 lg:col-span-8">
          <SplitReveal id="t-intro" className="display-md max-w-[20ch] text-primary-dark">
            {c.intro.heading}
          </SplitReveal>
          <Reveal className="mt-12 grid gap-8 md:grid-cols-2" stagger={0.1}>
            {c.intro.body.map((p) => (
              <p key={p.slice(0, 24)} data-reveal-item className="text-[1.02rem] leading-[1.8] text-ink/75">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Information({ c, variant }: { c: TreatmentCategoryContent; variant: TreatmentLayout["information"] }) {
  const items = (
    <Reveal as="ul" className={cn(variant === "columns" ? "grid gap-px bg-ink/10 md:grid-cols-3" : "border-t hairline")} stagger={0.1}>
      {c.information.map((item, i) => (
        <li
          key={item.title}
          data-reveal-item
          className={cn(variant === "columns" ? "bg-surface p-8 md:p-10" : "flex gap-6 border-b hairline py-8")}
        >
          <span className="font-display text-lg italic text-muted">0{i + 1}</span>
          <div className={variant === "columns" ? "mt-10" : ""}>
            <h3 className="font-display text-[1.75rem] leading-tight">{item.title}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">{item.body}</p>
          </div>
        </li>
      ))}
    </Reveal>
  );

  return (
    <section id="informacion" aria-labelledby="t-info" className={cn("scroll-mt-24 py-24 md:py-32", variant === "columns" && "bg-surface")}>
      <div className="container-x">
        {variant === "columns" ? (
          <>
            <Reveal className="mb-14 max-w-2xl">
              <SectionLabel>Información</SectionLabel>
              <h2 id="t-info" className="display-md mt-6 text-primary-dark">
                Lo que incluye <em className="font-light text-primary">tu experiencia.</em>
              </h2>
            </Reveal>
            {items}
          </>
        ) : (
          <div className="grid grid-cols-12 gap-x-6 gap-y-14">
            <div className="col-span-12 md:col-span-5">
              <ParallaxImage
                src={c.secondaryImage.src}
                alt={c.secondaryImage.alt}
                reveal
                className="aspect-[4/5] bg-surface"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-16">
              <Reveal>
                <SectionLabel>Información</SectionLabel>
                <h2 id="t-info" className="display-md mt-6 mb-12 text-primary-dark">
                  Lo que incluye <em className="font-light text-primary">tu experiencia.</em>
                </h2>
              </Reveal>
              {items}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Benefits({ c }: { c: TreatmentCategoryContent }) {
  // Solo se publica cuando el centro ha validado la lista.
  if (!c.benefits.length) return null;
  return (
    <section aria-labelledby="t-benefits" className="py-24">
      <div className="container-x">
        <SectionLabel>Beneficios</SectionLabel>
        <h2 id="t-benefits" className="display-md mt-6 text-primary-dark">Beneficios</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {c.benefits.map((b) => (
            <li key={b} className="border-t hairline pt-4 text-lg">{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process({ c, variant }: { c: TreatmentCategoryContent; variant: TreatmentLayout["process"] }) {
  if (variant === "sticky") {
    return (
      <section aria-labelledby="t-process" className="py-24 md:py-36">
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <div className="md:sticky md:top-32">
              <Reveal>
                <SectionLabel>Proceso</SectionLabel>
                <h2 id="t-process" className="display-md mt-6 max-w-[12ch] text-primary-dark">
                  Qué puedes <em className="font-light text-primary">esperar.</em>
                </h2>
                <p className="lead mt-6 max-w-sm">Paso a paso, con tiempo para resolver tus dudas.</p>
              </Reveal>
            </div>
          </div>
          <ol className="col-span-12 md:col-span-6 md:col-start-7">
            {c.process.map((step, i) => (
              <Reveal as="li" key={step.title} className="border-t hairline py-10 last:border-b">
                <div className="flex items-baseline gap-6">
                  <span className="font-display text-5xl italic leading-none text-accent">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-[1.9rem] leading-tight">{step.title}</h3>
                    <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink/70">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="t-process" className="py-24 md:py-36">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <SectionLabel>Proceso</SectionLabel>
          <h2 id="t-process" className="display-md mt-6 text-primary-dark">
            Qué puedes <em className="font-light text-primary">esperar.</em>
          </h2>
        </Reveal>
        <Reveal as="ol" className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" stagger={0.12}>
          {c.process.map((step, i) => (
            <li key={step.title} data-reveal-item className="relative">
              <div className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full border border-primary/40 font-display text-lg italic text-primary">
                  {i + 1}
                </span>
                <span className="h-px flex-1 bg-ink/15" aria-hidden />
              </div>
              <h3 className="mt-8 font-display text-[1.7rem] leading-tight">{step.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Suitability({ c, emphasized }: { c: TreatmentCategoryContent; emphasized?: boolean }) {
  return (
    <section aria-labelledby="t-suit" className={cn("py-20 md:py-28", emphasized ? "bg-background" : "bg-surface")}>
      <div className="container-x">
        <Reveal
          className={cn(
            "grid grid-cols-12 gap-x-6 gap-y-8 p-8 md:p-14",
            emphasized ? "border border-primary/30 bg-surface" : "border-y hairline !px-0",
          )}
        >
          <div className="col-span-12 md:col-span-4">
            <ShieldAlert size={28} strokeWidth={1} className="text-primary" aria-hidden />
            <p className="eyebrow mt-6 text-primary">Valoración profesional</p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 id="t-suit" className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-primary-dark">
              {c.suitability.heading}
            </h2>
            <div className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-ink/75">
              {c.suitability.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {c.suitability.note && (
              <p className="mt-6 border-l-2 border-primary pl-4 text-sm font-medium text-primary-dark">{c.suitability.note}</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AvailableTreatments({ c, treatments }: { c: TreatmentCategoryContent; treatments: { id: string; name: string; description: string; durationMinutes: number }[] }) {
  if (!treatments.length) return null;
  return (
    <section aria-labelledby="t-list" className="pb-8 pt-4">
      <div className="container-x">
        <Reveal className="border-t hairline pt-14">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 md:col-span-4">
              <SectionLabel>Reserva en línea</SectionLabel>
              <h2 id="t-list" className="mt-6 font-display text-[2.2rem] leading-tight text-primary-dark">Servicios disponibles</h2>
            </div>
            <ul className="col-span-12 md:col-span-8">
              {treatments.map((t) => (
                <li key={t.id} className="border-b hairline">
                  <Link
                    href={`/reservar?categoria=${c.category}&tratamiento=${t.id}`}
                    className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>
                      <span className="block font-display text-2xl transition-transform duration-500 ease-expo group-hover:translate-x-2">{t.name}</span>
                      {t.description && <span className="mt-1 block text-sm text-muted">{t.description}</span>}
                    </span>
                    <span className="flex items-center gap-5 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <Clock size={14} strokeWidth={1.4} aria-hidden /> {t.durationMinutes} min
                      </span>
                      <span className="link-underline link-underline-static text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                        Reservar
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faqs({ c }: { c: TreatmentCategoryContent }) {
  return (
    <section aria-labelledby="t-faq" className="py-24 md:py-32">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12">
        <Reveal className="col-span-12 md:col-span-4">
          <SectionLabel>Preguntas frecuentes</SectionLabel>
          <h2 id="t-faq" className="display-md mt-6 max-w-[10ch] text-primary-dark">
            Resolvemos <em className="font-light text-primary">tus dudas.</em>
          </h2>
        </Reveal>
        <div className="col-span-12 md:col-span-8">
          <Faq items={c.faqs} />
        </div>
      </div>
    </section>
  );
}

export async function TreatmentPage({ content, layout }: { content: TreatmentCategoryContent; layout: TreatmentLayout }) {
  const [site, catalog] = await Promise.all([getSiteContent(), getBookingCatalog()]);
  const treatments = catalog.treatments.filter((t) => t.category === content.category);

  return (
    <>
      <TreatmentHero content={content} variant={layout.hero} />
      {layout.suitabilityFirst && <Suitability c={content} emphasized />}
      <Introduction c={content} />
      <Information c={content} variant={layout.information} />
      <Benefits c={content} />
      <Process c={content} variant={layout.process} />
      {!layout.suitabilityFirst && <Suitability c={content} />}
      <AvailableTreatments c={content} treatments={treatments} />
      <Faqs c={content} />
      <RelatedExperiences current={content.category} />
      <BookingCta
        whatsappPhone={site.contact.whatsappPhone}
        messageKey={content.category}
        title={`Agenda tu ${content.category === "ASESORAMIENTO" ? "asesoramiento" : "valoración"}.`}
        text="Cuéntanos qué buscas y te acompañamos en el primer paso."
        image={content.detailImage}
      />
      <JsonLd data={serviceJsonLd(content)} />
      <JsonLd data={faqJsonLd(content.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Tratamientos", path: "/tratamientos" },
          { name: content.label, path: content.href },
        ])}
      />
    </>
  );
}
