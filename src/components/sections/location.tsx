import { Clock, MapPin, Navigation } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import type { SiteContent } from "@/lib/content";
import { mapsDirectionsUrl, mapsEmbedUrl, site } from "@/lib/site";
import { whatsappFor } from "@/lib/whatsapp";

export function Location({ contact, id = "contacto", number = "07" }: { contact: SiteContent["contact"]; id?: string; number?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative py-28 md:py-36">
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-14">
        <Reveal className="col-span-12 lg:col-span-5" stagger={0.08}>
          <div data-reveal-item>
            <SectionLabel number={number}>Ubicación</SectionLabel>
          </div>
          <h2 data-reveal-item id={`${id}-title`} className="display-md mt-8 max-w-[11ch] text-primary-dark">
            Te esperamos en <em className="font-light text-primary">Bogotá.</em>
          </h2>

          <dl data-reveal-item className="mt-12 divide-y divide-ink/10 border-y hairline">
            <div className="flex gap-5 py-5">
              <dt className="pt-0.5 text-primary">
                <MapPin size={18} strokeWidth={1.3} aria-label="Dirección" />
              </dt>
              <dd>
                <p className="font-display text-2xl leading-tight">{site.address.street}</p>
                <p className="mt-1 text-sm text-muted">
                  {site.address.city}, {site.address.country}
                </p>
              </dd>
            </div>
            <div className="flex gap-5 py-5">
              <dt className="pt-0.5 text-primary">
                <WhatsappIcon size={18} aria-label="WhatsApp" />
              </dt>
              <dd>
                <a href={whatsappFor("general", contact.whatsappPhone)} target="_blank" rel="noopener noreferrer" className="link-underline text-[0.95rem]">
                  {contact.whatsappDisplay}
                </a>
              </dd>
            </div>
            <div className="flex gap-5 py-5">
              <dt className="pt-0.5 text-primary">
                <InstagramIcon size={18} aria-label="Instagram" />
              </dt>
              <dd>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="link-underline text-[0.95rem]">
                  {site.instagram.handle}
                </a>
              </dd>
            </div>
            {contact.hoursNote && (
              <div className="flex gap-5 py-5">
                <dt className="pt-0.5 text-primary">
                  <Clock size={18} strokeWidth={1.3} aria-label="Horario" />
                </dt>
                <dd className="text-[0.95rem] text-ink/80">{contact.hoursNote}</dd>
              </div>
            )}
          </dl>

          <div data-reveal-item className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={mapsDirectionsUrl} external icon={<Navigation size={15} strokeWidth={1.5} />}>
              Cómo llegar
            </ButtonLink>
            <ButtonLink
              href={whatsappFor("general", contact.whatsappPhone)}
              external
              variant="outline"
              icon={<WhatsappIcon size={15} />}
            >
              WhatsApp
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-7">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            <iframe
              title={`Mapa: ${site.name}, ${site.address.street}, ${site.address.city}`}
              src={mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 grayscale-[0.85] sepia-[0.2] contrast-[0.95]"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
