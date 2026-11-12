/**
 * Datos verificados del negocio. Todo lo que no esté aquí debe tratarse como
 * contenido editable desde el panel (/admin/contenido) o como marcador de posición.
 */
export const site = {
  name: "Centro Estético Claudia Hernández",
  shortName: "Claudia Hernández",
  monogram: "CH",
  description:
    "Centro estético en Bogotá. Tratamientos faciales y corporales, cuidados postoperatorios y asesoramiento en cirugía plástica con atención personalizada.",
  locale: "es_CO",
  address: {
    street: "Cra 100b #77A-24",
    city: "Bogotá",
    region: "Bogotá D.C.",
    country: "Colombia",
    countryCode: "CO",
  },
  instagram: {
    handle: "@centroestetico_clauhernandez",
    url: "https://www.instagram.com/centroestetico_clauhernandez/",
  },
  whatsapp: {
    // Enlace oficial de reservas del centro.
    link: "https://wa.link/o5z3fk",
    // Número al que redirige el enlace oficial (formato internacional sin "+").
    phone: "573212702791",
    display: "+57 321 270 2791",
  },
  timeZone: "America/Bogota",
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.country}`;

export const mapsQuery = encodeURIComponent(`${site.address.street}, ${site.address.city}, ${site.address.country}`);
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed&hl=es`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
