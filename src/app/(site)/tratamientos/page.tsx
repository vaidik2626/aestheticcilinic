import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { BookingCta } from "@/components/sections/booking-cta";
import { JsonLd } from "@/components/ui/json-ld";
import { treatmentCategories } from "@/data/treatments";
import { getSiteContent } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Tratamientos estéticos en Bogotá",
  description:
    "Tratamientos faciales y corporales, cuidados postoperatorios y asesoramiento estético en Bogotá, siempre con valoración personalizada.",
  path: "/tratamientos",
});

const layouts = [
  { img: "md:col-span-7", text: "md:col-span-4 md:col-start-9", aspect: "aspect-[4/3]" },
  { img: "md:col-span-5 md:col-start-7 md:order-2", text: "md:col-span-4 md:col-start-2 md:order-1", aspect: "aspect-[4/5]" },
  { img: "md:col-span-6 md:col-start-2", text: "md:col-span-4 md:col-start-9", aspect: "aspect-[1/1]" },
  { img: "md:col-span-7 md:col-start-6 md:order-2", text: "md:col-span-4 md:col-start-1 md:order-1", aspect: "aspect-[16/10]" },
];

export default async function TreatmentsPage() {
  const { contact } = await getSiteContent();
  return (
    <>
      <PageHeader
        eyebrow="Tratamientos"
        title={<>Experiencias <em className="font-light text-primary">a tu medida.</em></>}
        lead="Cuatro áreas de cuidado, un mismo principio: cada tratamiento empieza por conocerte."
      />

      <section aria-label="Categorías de tratamiento" className="pb-24 md:pb-36">
        <div className="container-x space-y-24 md:space-y-40">
          {treatmentCategories.map((c, i) => {
            const l = layouts[i];
            return (
              <article key={c.slug} className="grid grid-cols-12 items-center gap-x-6 gap-y-8">
                <Link href={c.href} data-cursor="Descubrir" className={cn("group col-span-12", l.img)} tabIndex={-1} aria-hidden>
                  <Reveal className={cn("img-zoom relative overflow-hidden bg-surface-dark", l.aspect)}>
                    <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
                  </Reveal>
                </Link>
                <Reveal className={cn("col-span-12", l.text)} stagger={0.08}>
                  <p data-reveal-item className="font-display text-6xl italic leading-none text-accent">{c.number}</p>
                  <h2 data-reveal-item className="mt-6 font-display text-[clamp(2.3rem,4vw,3.6rem)] leading-[1] text-primary-dark">
                    <Link href={c.href} className="hover:text-primary">{c.label}</Link>
                  </h2>
                  <p data-reveal-item className="eyebrow mt-5 text-primary">{c.tagline}</p>
                  <p data-reveal-item className="mt-5 text-[1rem] leading-relaxed text-ink/75">{c.summary}</p>
                  <Link
                    data-reveal-item
                    href={c.href}
                    className="group mt-8 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-dark"
                  >
                    <span className="link-underline link-underline-static">Descubrir {c.shortLabel.toLowerCase()}</span>
                    <ArrowUpRight size={15} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>
              </article>
            );
          })}
        </div>
      </section>

      <BookingCta whatsappPhone={contact.whatsappPhone} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Tratamientos", path: "/tratamientos" }])} />
    </>
  );
}
