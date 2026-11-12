import { images, type SiteImage } from "@/data/images";
import type { TreatmentCategory } from "@/types/treatment";

/**
 * Contenido editorial de cada categoría de tratamiento.
 * Los textos describen el enfoque y el proceso; no prometen resultados ni
 * afirman certificaciones. Los beneficios se dejan vacíos hasta que el centro
 * los valide (la sección no se muestra mientras la lista esté vacía).
 */
export interface TreatmentCategoryContent {
  category: TreatmentCategory;
  slug: string;
  href: string;
  number: string;
  label: string;
  shortLabel: string;
  tagline: string;
  summary: string;
  image: SiteImage;
  secondaryImage: SiteImage;
  detailImage: SiteImage;
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; titleAccent: string; lead: string };
  intro: { heading: string; body: string[] };
  information: { title: string; body: string }[];
  benefits: string[];
  process: { title: string; body: string }[];
  suitability: { heading: string; body: string[]; note?: string };
  faqs: { q: string; a: string }[];
}

const assessmentFaq = {
  q: "¿Necesito una valoración antes de iniciar?",
  a: "Sí. Cada persona es diferente, por eso el primer paso es una valoración en la que el equipo conoce tus necesidades y determina si el tratamiento es adecuado para ti.",
};

const pricingFaq = {
  q: "¿Cuál es el valor del tratamiento?",
  a: "El valor depende del tratamiento y de lo que se defina en tu valoración. Escríbenos por WhatsApp y te compartiremos información actualizada.",
};

const bookingFaq = {
  q: "¿Cómo reservo mi cita?",
  a: "Puedes enviar tu solicitud desde la sección Reservar, eligiendo tratamiento, fecha y hora. El centro revisa cada solicitud y te contacta para confirmarla. También puedes escribirnos por WhatsApp.",
};

export const treatmentCategories: TreatmentCategoryContent[] = [
  {
    category: "FACIAL",
    slug: "tratamientos-faciales",
    href: "/tratamientos-faciales",
    number: "01",
    label: "Tratamientos faciales",
    shortLabel: "Faciales",
    tagline: "El ritual de tu piel",
    summary:
      "Protocolos faciales pensados para tu tipo de piel, con atención detallada en cada etapa del cuidado.",
    image: images.facial,
    secondaryImage: images.facialAlt,
    detailImage: images.guaSha,
    seo: {
      title: "Tratamientos faciales en Bogotá",
      description:
        "Tratamientos faciales personalizados en Bogotá. Valoración de tu piel y protocolos de cuidado en el Centro Estético Claudia Hernández.",
    },
    hero: {
      eyebrow: "01 — Tratamientos faciales",
      title: "Tu piel,",
      titleAccent: "con nombre propio.",
      lead: "Cada rostro cuenta una historia distinta. Escuchamos la tuya antes de proponer cualquier cuidado.",
    },
    intro: {
      heading: "Un cuidado facial que empieza por conocerte.",
      body: [
        "En el Centro Estético Claudia Hernández entendemos el cuidado facial como un proceso personal. Antes de cada protocolo nos tomamos el tiempo de observar tu piel, conversar sobre tus hábitos y entender lo que buscas.",
        "A partir de esa valoración diseñamos una experiencia a tu medida, en un espacio tranquilo y con atención dedicada de principio a fin.",
      ],
    },
    information: [
      {
        title: "Valoración de la piel",
        body: "Analizamos tus necesidades y tu rutina actual para definir el cuidado más adecuado.",
      },
      {
        title: "Protocolos personalizados",
        body: "El tratamiento se adapta a tu piel y a tus objetivos, no al revés.",
      },
      {
        title: "Recomendaciones para casa",
        body: "Te orientamos sobre cómo acompañar el tratamiento con tu rutina diaria.",
      },
    ],
    benefits: [],
    process: [
      { title: "Conversación inicial", body: "Conocemos tu piel, tus hábitos y lo que esperas del tratamiento." },
      { title: "Valoración", body: "La especialista determina qué protocolo es adecuado para ti." },
      { title: "Tratamiento", body: "Vives el cuidado en un ambiente sereno, con atención constante." },
      { title: "Seguimiento", body: "Recibes recomendaciones y, si corresponde, un plan de sesiones." },
    ],
    suitability: {
      heading: "Cada piel requiere una valoración profesional.",
      body: [
        "La idoneidad de cualquier tratamiento facial depende de las características de tu piel, de tu historial y de la valoración que realice el equipo.",
        "Si tienes alguna condición dermatológica, alergias o estás siguiendo un tratamiento médico, cuéntanoslo durante tu valoración.",
      ],
    },
    faqs: [
      assessmentFaq,
      {
        q: "¿Cuántas sesiones necesito?",
        a: "Depende de tu piel y de tus objetivos. Lo definimos contigo después de la valoración; no trabajamos con planes genéricos.",
      },
      pricingFaq,
      bookingFaq,
    ],
  },
  {
    category: "CORPORAL",
    slug: "tratamientos-corporales",
    href: "/tratamientos-corporales",
    number: "02",
    label: "Tratamientos corporales",
    shortLabel: "Corporales",
    tagline: "Bienestar en cada gesto",
    summary:
      "Tratamientos corporales que combinan técnica y bienestar, adaptados a lo que tu cuerpo necesita.",
    image: images.body,
    secondaryImage: images.bodyStones,
    detailImage: images.product,
    seo: {
      title: "Tratamientos corporales en Bogotá",
      description:
        "Tratamientos corporales personalizados en Bogotá con valoración previa y atención dedicada en el Centro Estético Claudia Hernández.",
    },
    hero: {
      eyebrow: "02 — Tratamientos corporales",
      title: "El cuerpo",
      titleAccent: "también se escucha.",
      lead: "Técnica, calma y atención en cada sesión. Un tiempo dedicado por completo a ti.",
    },
    intro: {
      heading: "Tratamientos corporales a tu ritmo.",
      body: [
        "Nuestros tratamientos corporales parten de una valoración individual. Escuchamos lo que buscas y diseñamos un plan acorde con tu cuerpo y tu estilo de vida.",
        "Cada sesión transcurre en un ambiente cuidado, con el tiempo necesario para que el tratamiento sea también una pausa para ti.",
      ],
    },
    information: [
      { title: "Plan individual", body: "Definimos contigo la frecuencia y el tipo de sesiones tras tu valoración." },
      { title: "Técnicas manuales", body: "El trabajo se adapta a tu cuerpo y a la sensibilidad de cada zona." },
      { title: "Acompañamiento", body: "Revisamos tu evolución y ajustamos el plan cuando es necesario." },
    ],
    benefits: [],
    process: [
      { title: "Valoración", body: "Revisamos tus objetivos y tu historial para orientar el tratamiento." },
      { title: "Propuesta", body: "Te explicamos el plan sugerido, su duración y lo que implica." },
      { title: "Sesiones", body: "Cada encuentro se realiza con calma y atención personalizada." },
      { title: "Revisión", body: "Evaluamos juntos cómo te sientes y ajustamos el camino." },
    ],
    suitability: {
      heading: "Tu cuerpo, tu valoración.",
      body: [
        "No todos los tratamientos son adecuados para todas las personas. La recomendación final depende de tu estado de salud y de la valoración profesional.",
        "Si estás embarazada, tienes alguna condición médica o tomas medicación, coméntalo antes de iniciar.",
      ],
    },
    faqs: [
      assessmentFaq,
      {
        q: "¿Qué debo llevar a mi cita?",
        a: "Ropa cómoda y la disposición de dedicarte ese tiempo. Si hay alguna indicación especial, te la comunicaremos al confirmar tu cita.",
      },
      pricingFaq,
      bookingFaq,
    ],
  },
  {
    category: "POSTOPERATORIO",
    slug: "cuidados-postoperatorios",
    href: "/cuidados-postoperatorios",
    number: "03",
    label: "Cuidados postoperatorios",
    shortLabel: "Postoperatorios",
    tagline: "Acompañamiento con responsabilidad",
    summary:
      "Acompañamiento estético durante tu recuperación, siempre en coordinación con las indicaciones de tu cirujano.",
    image: images.postop,
    secondaryImage: images.careHands,
    detailImage: images.towel,
    seo: {
      title: "Cuidados postoperatorios en Bogotá",
      description:
        "Cuidados estéticos postoperatorios en Bogotá, con valoración profesional y respeto por las indicaciones de tu médico tratante.",
    },
    hero: {
      eyebrow: "03 — Cuidados postoperatorios",
      title: "Acompañarte",
      titleAccent: "también es cuidarte.",
      lead: "La recuperación es un proceso delicado. Te acompañamos con atención, paciencia y respeto por las indicaciones de tu médico.",
    },
    intro: {
      heading: "Especialistas en acompañamiento postoperatorio.",
      body: [
        "El periodo posterior a una cirugía requiere cuidados específicos. Nuestro papel es acompañarte durante esa etapa con un servicio estético complementario y siempre coordinado con las indicaciones de tu cirujano.",
        "Antes de iniciar, revisamos tu caso de forma individual. Nunca reemplazamos el seguimiento médico: lo complementamos.",
      ],
    },
    information: [
      {
        title: "Valoración individual",
        body: "Revisamos tu procedimiento, el tiempo transcurrido y las indicaciones de tu médico tratante.",
      },
      {
        title: "Plan coordinado",
        body: "El número y tipo de sesiones se define según tu evolución y la autorización médica.",
      },
      {
        title: "Atención cuidadosa",
        body: "Trabajamos con delicadeza, respetando los tiempos y la sensibilidad de tu recuperación.",
      },
    ],
    benefits: [],
    process: [
      { title: "Contacto inicial", body: "Nos cuentas sobre tu procedimiento y la fecha de tu cirugía." },
      { title: "Valoración", body: "Revisamos tu caso y las indicaciones de tu cirujano antes de proponer un plan." },
      { title: "Sesiones", body: "Te acompañamos en cada sesión, con atención a cómo te sientes." },
      { title: "Seguimiento", body: "Ajustamos el plan según tu evolución y lo que indique tu médico." },
    ],
    suitability: {
      heading: "Información importante sobre tu recuperación.",
      body: [
        "La idoneidad y el protocolo de cualquier cuidado postoperatorio dependen de tu condición médica, del procedimiento realizado y de la valoración profesional.",
        "Nuestros servicios son complementarios y no sustituyen el control ni las indicaciones de tu cirujano. Ante cualquier síntoma de alarma, consulta de inmediato con tu médico tratante.",
      ],
      note: "No realizamos diagnósticos médicos ni garantizamos resultados de recuperación.",
    },
    faqs: [
      {
        q: "¿Cuándo puedo iniciar los cuidados postoperatorios?",
        a: "Depende del procedimiento y de lo que indique tu cirujano. Lo revisamos contigo en la valoración y siempre respetamos la autorización médica.",
      },
      {
        q: "¿Necesito autorización de mi médico?",
        a: "Te pediremos que nos compartas las indicaciones de tu médico tratante. Nuestros cuidados se coordinan con ellas y no las reemplazan.",
      },
      pricingFaq,
      bookingFaq,
    ],
  },
  {
    category: "ASESORAMIENTO",
    slug: "asesoramiento-estetico",
    href: "/asesoramiento-estetico",
    number: "04",
    label: "Asesoramiento estético",
    shortLabel: "Asesoramiento",
    tagline: "Decidir con información",
    summary:
      "Orientación personalizada y asesoramiento en cirugía plástica para que tomes decisiones informadas.",
    image: images.consult,
    secondaryImage: images.bottles,
    detailImage: images.interiorSpa,
    seo: {
      title: "Asesoramiento estético y en cirugía plástica en Bogotá",
      description:
        "Asesoramiento estético personalizado y orientación en cirugía plástica en Bogotá. Resolvemos tus dudas para que decidas con información.",
    },
    hero: {
      eyebrow: "04 — Asesoramiento estético",
      title: "Las mejores decisiones",
      titleAccent: "empiezan con una conversación.",
      lead: "Te escuchamos, resolvemos tus dudas y te orientamos con honestidad, sin presiones.",
    },
    intro: {
      heading: "Asesoramiento en cirugía plástica y estética.",
      body: [
        "Considerar un procedimiento estético es una decisión importante. Nuestro asesoramiento te ayuda a entender tus opciones, organizar tus preguntas y prepararte para tus consultas médicas.",
        "Es un espacio de orientación: la indicación de cualquier procedimiento quirúrgico corresponde siempre a un médico especialista.",
      ],
    },
    information: [
      { title: "Escucha activa", body: "Conversamos sobre lo que buscas, tus expectativas y tus inquietudes." },
      { title: "Orientación", body: "Te ayudamos a comprender las alternativas y los pasos de cada proceso." },
      { title: "Preparación", body: "Te acompañamos a preparar tus consultas con el especialista." },
    ],
    benefits: [],
    process: [
      { title: "Primer contacto", body: "Agendas tu espacio de asesoramiento por la web o WhatsApp." },
      { title: "Conversación", body: "Hablamos con calma sobre tus objetivos y dudas." },
      { title: "Orientación", body: "Te compartimos información para que decidas con claridad." },
      { title: "Acompañamiento", body: "Si lo deseas, te acompañamos en los siguientes pasos." },
    ],
    suitability: {
      heading: "Orientación, no diagnóstico.",
      body: [
        "El asesoramiento estético no sustituye una consulta médica. La valoración y la indicación de cualquier procedimiento quirúrgico corresponden a un cirujano plástico.",
        "Nuestro objetivo es que llegues a esa consulta con información clara y expectativas realistas.",
      ],
    },
    faqs: [
      {
        q: "¿El asesoramiento reemplaza la consulta con el cirujano?",
        a: "No. Es un acompañamiento complementario. La indicación de cualquier procedimiento corresponde siempre a un médico especialista.",
      },
      {
        q: "¿Qué puedo preguntar en el asesoramiento?",
        a: "Todo lo que te inquiete: opciones, preparación, tiempos de recuperación esperados según te indique tu médico y cuidados posteriores.",
      },
      pricingFaq,
      bookingFaq,
    ],
  },
];

export const categoryByKey = Object.fromEntries(
  treatmentCategories.map((c) => [c.category, c]),
) as Record<TreatmentCategory, TreatmentCategoryContent>;

export function getCategoryBySlug(slug: string) {
  return treatmentCategories.find((c) => c.slug === slug);
}
