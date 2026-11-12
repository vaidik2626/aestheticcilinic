/**
 * Fotografías de marcador de posición (Unsplash, licencia libre).
 * Sustitúyelas por fotografía original del centro reemplazando los archivos en
 * /public/images manteniendo el mismo nombre, o cambiando las rutas aquí.
 */
export const images = {
  hero: { src: "/images/hero.jpg", alt: "Mujer con la piel luminosa y los ojos cerrados bajo luz natural cálida" },
  heroDetail: { src: "/images/serum-skin.jpg", alt: "Gota de sérum aplicada sobre la piel" },
  intro: { src: "/images/serum-wood.jpg", alt: "Frasco de sérum sobre madera junto a hojas de eucalipto" },
  facial: { src: "/images/facial-mask.jpg", alt: "Aplicación de mascarilla facial con pincel durante un tratamiento" },
  facialAlt: { src: "/images/facial-cream.jpg", alt: "Tratamiento facial con mascarilla hidratante" },
  facialHands: { src: "/images/facial-hands.jpg", alt: "Manos de especialista realizando un tratamiento facial" },
  facialTool: { src: "/images/facial-tool.jpg", alt: "Tratamiento facial con instrumental profesional" },
  body: { src: "/images/body-oil.jpg", alt: "Aplicación de aceite durante un tratamiento corporal" },
  bodyStones: { src: "/images/body-stones.jpg", alt: "Tratamiento corporal con piedras calientes" },
  bodyStonesAlt: { src: "/images/body-stones-2.jpg", alt: "Piedras calientes alineadas sobre la espalda" },
  postop: { src: "/images/postop-hands.jpg", alt: "Manos realizando un masaje suave y cuidadoso" },
  careHands: { src: "/images/care-hands.jpg", alt: "Manos entrelazadas sobre una textura suave" },
  consult: { src: "/images/consult-portrait.jpg", alt: "Retrato de una mujer con expresión serena" },
  interiorBath: { src: "/images/interior-bath.jpg", alt: "Espacio de bienestar con bañera de piedra y plantas" },
  interiorSpa: { src: "/images/interior-spa.jpg", alt: "Espacio de descanso con luz natural y vegetación" },
  bottles: { src: "/images/still-bottles.jpg", alt: "Frascos de cuidado de la piel en tonos neutros" },
  towel: { src: "/images/still-towel.jpg", alt: "Toalla, cepillo y jabón natural sobre superficie clara" },
  product: { src: "/images/still-product.jpg", alt: "Crema de cuidado corporal sobre lino blanco" },
  dropper: { src: "/images/still-dropper.jpg", alt: "Gotero de aceite esencial en penumbra" },
  oils: { src: "/images/oils-hands.jpg", alt: "Manos preparando aceites para un tratamiento" },
  guaSha: { src: "/images/gua-sha.jpg", alt: "Rodillo facial y piedra gua sha de cuarzo rosa" },
} as const;

export type SiteImage = (typeof images)[keyof typeof images];
