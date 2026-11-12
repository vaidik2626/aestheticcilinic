import type { MetadataRoute } from "next";
import { treatmentCategories } from "@/data/treatments";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/tratamientos", priority: 0.9, freq: "monthly" },
    ...treatmentCategories.map((c) => ({ path: c.href, priority: 0.9, freq: "monthly" as const })),
    { path: "/reservar", priority: 0.8, freq: "weekly" },
    { path: "/sobre-nosotros", priority: 0.7, freq: "monthly" },
    { path: "/nuestra-experiencia", priority: 0.7, freq: "monthly" },
    { path: "/contacto", priority: 0.7, freq: "monthly" },
    { path: "/politica-de-privacidad", priority: 0.2, freq: "yearly" },
    { path: "/politica-de-reservas", priority: 0.2, freq: "yearly" },
  ];
  return pages.map((p) => ({ url: absoluteUrl(p.path), lastModified: now, changeFrequency: p.freq, priority: p.priority }));
}
