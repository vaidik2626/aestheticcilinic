import { ParallaxImage } from "@/components/animations/parallax-image";
import { Reveal } from "@/components/animations/reveal";
import { SplitReveal } from "@/components/animations/split-reveal";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { images } from "@/data/images";
import { whatsappFor, type WhatsappMessageKey } from "@/lib/whatsapp";

interface BookingCtaProps {
  whatsappPhone: string;
  title?: string;
  text?: string;
  messageKey?: WhatsappMessageKey;
  image?: { src: string; alt: string };
}

export function BookingCta({
  whatsappPhone,
  title = "Tu próximo paso hacia el bienestar comienza aquí.",
  text = "Agenda tu cita y recibe atención personalizada.",
  messageKey = "appointment",
  image = images.oils,
}: BookingCtaProps) {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-primary-dark text-background">
      <div className="absolute inset-0 opacity-45" aria-hidden>
        <ParallaxImage src={image.src} alt="" className="h-full w-full" strength={14} sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/80 to-primary-dark/30" aria-hidden />
      <div className="grain absolute inset-0" aria-hidden />

      <div className="container-x relative grid grid-cols-12 gap-x-6 py-28 md:py-44">
        <div className="col-span-12 lg:col-span-9">
          <Reveal>
            <p className="eyebrow flex items-center gap-4 text-background/70">
              <span className="h-px w-10 bg-background/40" aria-hidden />
              Reserva
            </p>
          </Reveal>
          <SplitReveal id="cta-title" className="display-lg mt-8 max-w-[15ch]">
            {title}
          </SplitReveal>
          <Reveal className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between" stagger={0.1}>
            <p data-reveal-item className="max-w-sm text-lg leading-relaxed text-background/80">
              {text}
            </p>
            <div data-reveal-item className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/reservar" variant="light">
                Reservar mi cita
              </ButtonLink>
              <ButtonLink
                href={whatsappFor(messageKey, whatsappPhone)}
                external
                variant="outline-light"
                icon={<WhatsappIcon size={16} />}
              >
                Consultar por WhatsApp
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
