import type { Metadata } from "next";
import { ParallaxImage } from "@/components/animations/parallax-image";
import { PageHeader } from "@/components/layout/page-header";
import { BookingCta } from "@/components/sections/booking-cta";
import { GallerySection } from "@/components/sections/gallery-section";
import { Journey } from "@/components/sections/journey";
import { images } from "@/data/images";
import { getGallery, getSiteContent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nuestra experiencia",
  description:
    "Así es una visita al Centro Estético Claudia Hernández en Bogotá: un recorrido sereno desde la primera conversación hasta el seguimiento.",
  path: "/nuestra-experiencia",
  image: images.interiorBath.src,
});

export default async function ExperiencePage() {
  const [{ contact }, gallery] = await Promise.all([getSiteContent(), getGallery()]);
  return (
    <>
      <PageHeader
        eyebrow="Nuestra experiencia"
        title={<>Cada visita, <em className="font-light text-primary">un ritual.</em></>}
        lead="Un espacio tranquilo, atención sin prisas y un acompañamiento que continúa después de tu sesión."
      />
      <div className="container-x pb-24 md:pb-32">
        <ParallaxImage
          src={images.interiorSpa.src}
          alt={images.interiorSpa.alt}
          reveal
          priority
          className="aspect-[16/10] bg-surface md:aspect-[21/9]"
          sizes="100vw"
        />
      </div>
      <Journey />
      <GallerySection items={gallery} id="galeria" />
      <BookingCta whatsappPhone={contact.whatsappPhone} />
    </>
  );
}
