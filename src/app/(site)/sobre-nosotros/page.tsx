import type { Metadata } from "next";
import { ParallaxImage } from "@/components/animations/parallax-image";
import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { PageHeader } from "@/components/layout/page-header";
import { EditableText } from "@/components/sections/about-claudia";
import { BookingCta } from "@/components/sections/booking-cta";
import { FounderPortrait } from "@/components/sections/founder-portrait";
import { WhyUs } from "@/components/sections/why-us";
import { SectionLabel } from "@/components/ui/section-label";
import { images } from "@/data/images";
import { getSiteContent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sobre nosotros",
  description:
    "Conoce el Centro Estético Claudia Hernández en Bogotá: un espacio pensado para cuidarte, con atención personalizada en cada tratamiento.",
  path: "/sobre-nosotros",
});

export default async function AboutPage() {
  const { about, contact } = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Sobre nosotros"
        title={<>Un espacio pensado <em className="font-light text-primary">para cuidarte.</em></>}
        lead="Tratamientos faciales y corporales, especialistas en postoperatorios y asesoramiento en cirugía plástica."
      />

      <section aria-labelledby="founder-title" className="pb-24 md:pb-36">
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <Reveal>
              <FounderPortrait src={about.portraitSrc || undefined} className="aspect-[4/5] w-full md:sticky md:top-28" />
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Reveal>
              <SectionLabel number="01">Claudia Hernández</SectionLabel>
              <h2 id="founder-title" className="display-md mt-6 text-primary-dark">
                La persona detrás <em className="font-light text-primary">del cuidado.</em>
              </h2>
            </Reveal>
            <div className="mt-12 space-y-12">
              {[
                { label: "Presentación", text: about.introduction },
                { label: "Trayectoria profesional", text: about.background },
              ].map((b) => (
                <Reveal key={b.label} className="border-t hairline pt-6">
                  <p className="eyebrow text-primary">{b.label}</p>
                  <EditableText text={b.text} className="mt-5 text-[1.05rem] leading-[1.8] text-ink/80" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="philosophy-title" className="bg-surface py-28 md:py-40">
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <SectionLabel number="02">Filosofía</SectionLabel>
            <SplitReveal id="philosophy-title" className="display-lg mt-8 text-primary-dark">
              Escuchar primero. Cuidar siempre.
            </SplitReveal>
            <Reveal className="mt-12 grid gap-10 md:grid-cols-2" stagger={0.1}>
              <div data-reveal-item>
                <p className="eyebrow text-primary">Nuestra filosofía</p>
                <EditableText text={about.philosophy} className="mt-4 leading-relaxed text-ink/75" />
              </div>
              <div data-reveal-item>
                <p className="eyebrow text-primary">Atención personalizada</p>
                <EditableText text={about.approach} className="mt-4 leading-relaxed text-ink/75" />
              </div>
            </Reveal>
          </div>
          <div className="col-span-10 col-start-3 lg:col-span-4 lg:col-start-9">
            <ParallaxImage src={images.bottles.src} alt={images.bottles.alt} reveal className="aspect-[3/4] bg-surface-dark" sizes="(min-width: 1024px) 30vw, 80vw" />
          </div>
        </div>
      </section>

      <WhyUs />
      <BookingCta whatsappPhone={contact.whatsappPhone} />
    </>
  );
}
