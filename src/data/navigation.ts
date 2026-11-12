export interface NavItem {
  label: string;
  href: string;
  /** id de la sección del inicio para el indicador activo. */
  sectionId?: string;
  megaMenu?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Inicio", href: "/", sectionId: "inicio" },
  { label: "Tratamientos", href: "/tratamientos", sectionId: "tratamientos", megaMenu: true },
  { label: "Sobre nosotros", href: "/sobre-nosotros", sectionId: "sobre-nosotros" },
  { label: "Nuestra experiencia", href: "/nuestra-experiencia", sectionId: "experiencia" },
  { label: "Contacto", href: "/contacto", sectionId: "contacto" },
];

export const legalNav: NavItem[] = [
  { label: "Política de privacidad", href: "/politica-de-privacidad" },
  { label: "Política de reservas", href: "/politica-de-reservas" },
];
