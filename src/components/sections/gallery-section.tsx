import { Reveal } from "@/components/animations/reveal";
import { Gallery } from "@/components/gallery/gallery";
import { TextLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import type { PublicGalleryImage } from "@/lib/data";
import { site } from "@/lib/site";

export function GallerySection({ items, id = "experiencia" }: { items: PublicGalleryImage[]; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-gallery-title`} className="relative py-28 md:py-40">
      <div className="container-x">
        <Reveal className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end" stagger={0.08}>
          <div>
            <div data-reveal-item>
              <SectionLabel number="05">Galería</SectionLabel>
            </div>
            <h2 data-reveal-item id={`${id}-gallery-title`} className="display-lg mt-8 max-w-[12ch] text-primary-dark">
              Un lugar para <em className="font-light text-primary">detenerse.</em>
            </h2>
          </div>
          <div data-reveal-item className="max-w-xs">
            <p className="text-[0.95rem] leading-relaxed text-ink/70">
              Espacios, rituales y detalles que forman parte de cada visita.
            </p>
            <TextLink href={site.instagram.url} external className="mt-6">
              Síguenos en Instagram
            </TextLink>
          </div>
        </Reveal>
        <Gallery items={items} />
      </div>
    </section>
  );
}
