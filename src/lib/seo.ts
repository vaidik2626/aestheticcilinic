import type { Metadata } from "next";
import { treatmentCategories, type TreatmentCategoryContent } from "@/data/treatments";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function pageMetadata({ title, description, path, image = "/images/hero.jpg", noIndex }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url: path,
      images: [{ url: image, width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [image] },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

/** LocalBusiness con datos verificados únicamente (sin horarios, precios ni reseñas inventadas). */
export function localBusinessJsonLd(whatsappPhone: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absoluteUrl("/#negocio"),
    name: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    image: absoluteUrl("/images/hero.jpg"),
    telephone: `+${whatsappPhone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    areaServed: { "@type": "City", name: "Bogotá" },
    sameAs: [site.instagram.url],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tratamientos",
      itemListElement: treatmentCategories.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c.label, url: absoluteUrl(c.href) },
      })),
    },
  };
}

export function serviceJsonLd(c: TreatmentCategoryContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: c.label,
    serviceType: c.label,
    description: c.seo.description,
    url: absoluteUrl(c.href),
    areaServed: { "@type": "City", name: "Bogotá" },
    provider: { "@id": absoluteUrl("/#negocio") },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
