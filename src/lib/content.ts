import { z } from "zod";

/**
 * Contenido editable del sitio. Los valores por defecto son marcadores de
 * posición claramente identificables hasta que el centro los reemplace desde
 * /admin/contenido. No incluyen titulaciones ni datos biográficos inventados.
 */
export const siteContentSchema = z.object({
  contact: z.object({
    whatsappPhone: z.string().regex(/^\d{8,15}$/, "Solo dígitos, con indicativo de país (p. ej. 573001234567)"),
    whatsappDisplay: z.string().min(3).max(40),
    email: z.union([z.literal(""), z.email("Correo no válido")]),
    hoursNote: z.string().max(200),
  }),
  home: z.object({
    heroHeadline: z.string().min(3).max(120),
    heroText: z.string().min(3).max(300),
    introHeadline: z.string().min(3).max(160),
    introBody: z.string().min(3).max(1200),
    editorialText: z.string().min(3).max(600),
  }),
  about: z.object({
    introduction: z.string().max(1500),
    background: z.string().max(1500),
    philosophy: z.string().max(1500),
    approach: z.string().max(1500),
    portraitSrc: z.string().max(500),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const PLACEHOLDER_PREFIX = "[Pendiente]";

export const defaultSiteContent: SiteContent = {
  contact: {
    whatsappPhone: "573212702791",
    whatsappDisplay: "+57 321 270 2791",
    email: "",
    hoursNote: "Atención con cita previa.",
  },
  home: {
    heroHeadline: "Tu belleza merece un cuidado extraordinario.",
    heroText:
      "Experiencias estéticas personalizadas que combinan cuidado, bienestar y atención especializada.",
    introHeadline: "El bienestar comienza cuando te dedicas tiempo.",
    introBody:
      "En el Centro Estético Claudia Hernández cada tratamiento empieza con una conversación. Escuchamos lo que buscas, valoramos lo que tu piel y tu cuerpo necesitan y diseñamos una experiencia a tu medida: tratamientos faciales y corporales, acompañamiento postoperatorio y asesoramiento estético en un espacio pensado para que te sientas en calma.",
    editorialText:
      "Desde la primera conversación hasta el último detalle de cada sesión, cuidamos el ritmo, el espacio y la atención para que tu experiencia sea tan importante como el tratamiento.",
  },
  about: {
    introduction: `${PLACEHOLDER_PREFIX} Presentación de Claudia Hernández. Este texto se edita desde el panel de administración.`,
    background: `${PLACEHOLDER_PREFIX} Trayectoria profesional de Claudia. Publica aquí únicamente información verificada por el centro.`,
    philosophy: `${PLACEHOLDER_PREFIX} Filosofía de cuidado del centro, en palabras de Claudia.`,
    approach: `${PLACEHOLDER_PREFIX} Cómo es la atención personalizada en el centro.`,
    portraitSrc: "",
  },
};

export function isPlaceholder(text: string) {
  return text.trim().startsWith(PLACEHOLDER_PREFIX);
}

/** Combina contenido guardado con los valores por defecto (tolerante a versiones antiguas). */
export function parseSiteContent(raw: unknown): SiteContent {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof SiteContent, object>>;
  const merged = {
    contact: { ...defaultSiteContent.contact, ...(obj.contact ?? {}) },
    home: { ...defaultSiteContent.home, ...(obj.home ?? {}) },
    about: { ...defaultSiteContent.about, ...(obj.about ?? {}) },
  };
  const parsed = siteContentSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaultSiteContent;
}
