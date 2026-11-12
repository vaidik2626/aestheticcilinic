import "server-only";
import { cache } from "react";
import { images } from "@/data/images";
import { defaultSiteContent, parseSiteContent, type SiteContent } from "@/lib/content";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { PublicTreatment, TreatmentCategory } from "@/types/treatment";

/**
 * Lecturas públicas con degradación elegante: si la base de datos no está
 * configurada o no responde, el sitio sigue mostrando contenido por defecto.
 */
async function safely<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error(`[data] ${label}:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

export const getSiteContent = cache(
  (): Promise<SiteContent> =>
    safely(
      async () => {
        const row = await prisma.siteContent.findUnique({ where: { id: "default" } });
        return row ? parseSiteContent(row.content) : defaultSiteContent;
      },
      defaultSiteContent,
      "siteContent",
    ),
);

export interface PublicGalleryImage {
  id: string;
  src: string;
  alt: string;
  label: string;
}

export const defaultGallery: PublicGalleryImage[] = [
  { id: "g1", ...images.interiorSpa, label: "Nuestro espacio" },
  { id: "g2", ...images.facialAlt, label: "Faciales" },
  { id: "g3", ...images.bottles, label: "Rituales" },
  { id: "g4", ...images.body, label: "Corporales" },
  { id: "g5", ...images.interiorBath, label: "Bienestar" },
  { id: "g6", ...images.facialHands, label: "Atención" },
  { id: "g7", ...images.towel, label: "Detalles" },
  { id: "g8", ...images.bodyStonesAlt, label: "Calma" },
];

export const getGallery = cache(
  (): Promise<PublicGalleryImage[]> =>
    safely(
      async () => {
        const rows = await prisma.galleryImage.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        return rows.length ? rows.map(({ id, src, alt, label }) => ({ id, src, alt, label })) : defaultGallery;
      },
      defaultGallery,
      "gallery",
    ),
);

export interface PublicTestimonial {
  id: string;
  firstName: string;
  text: string;
  category: TreatmentCategory | null;
}

/** Solo testimonios publicados y con autorización expresa de la clienta. */
export const getTestimonials = cache(
  (): Promise<PublicTestimonial[]> =>
    safely(
      () =>
        prisma.testimonial.findMany({
          where: { published: true, consentConfirmed: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          select: { id: true, firstName: true, text: true, category: true },
        }),
      [],
      "testimonials",
    ),
);

export interface BookingCatalog {
  available: boolean;
  onlineBookingActive: boolean;
  treatments: PublicTreatment[];
}

export const getBookingCatalog = cache(
  (): Promise<BookingCatalog> =>
    safely<BookingCatalog>(
      async () => {
        const [settings, treatments, rules] = await Promise.all([
          prisma.bookingSettings.findUnique({ where: { id: "default" } }),
          prisma.treatment.findMany({
            where: { active: true },
            orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
            select: { id: true, category: true, name: true, description: true, durationMinutes: true },
          }),
          prisma.availabilityRule.count({ where: { active: true } }),
        ]);
        return {
          available: true,
          onlineBookingActive: Boolean(settings?.onlineBookingActive) && rules > 0 && treatments.length > 0,
          treatments,
        };
      },
      { available: false, onlineBookingActive: false, treatments: [] },
      "bookingCatalog",
    ),
);
