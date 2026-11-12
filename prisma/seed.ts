/**
 * Datos iniciales. Es idempotente: solo crea lo que no existe.
 *
 * - Configuración de reservas con la reserva en línea DESACTIVADA.
 * - Tratamientos de ejemplo (editables desde /admin/tratamientos).
 * - Contenido editable por defecto y galería con las imágenes de marcador.
 *
 * El horario semanal NO se crea: debe configurarlo el centro en
 * /admin/disponibilidad. Para pruebas locales puedes usar
 * SEED_DEMO_AVAILABILITY=true, que crea un horario de demostración.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type TreatmentCategory } from "../src/generated/prisma/client";
import { defaultSiteContent } from "../src/lib/content";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const exampleTreatments: { category: TreatmentCategory; name: string; slug: string; description: string; durationMinutes: number }[] = [
  { category: "FACIAL", name: "Valoración facial", slug: "valoracion-facial", description: "Primera cita para conocer tu piel y definir el cuidado adecuado.", durationMinutes: 45 },
  { category: "FACIAL", name: "Limpieza facial", slug: "limpieza-facial", description: "Protocolo de limpieza adaptado a tu tipo de piel.", durationMinutes: 75 },
  { category: "CORPORAL", name: "Valoración corporal", slug: "valoracion-corporal", description: "Conversación y valoración para orientar tu plan corporal.", durationMinutes: 45 },
  { category: "CORPORAL", name: "Sesión de tratamiento corporal", slug: "sesion-corporal", description: "Sesión según el plan definido en tu valoración.", durationMinutes: 60 },
  { category: "POSTOPERATORIO", name: "Valoración postoperatoria", slug: "valoracion-postoperatoria", description: "Revisión de tu caso y de las indicaciones de tu cirujano.", durationMinutes: 45 },
  { category: "POSTOPERATORIO", name: "Sesión de cuidado postoperatorio", slug: "sesion-postoperatoria", description: "Sesión de acompañamiento según tu plan y la autorización médica.", durationMinutes: 60 },
  { category: "ASESORAMIENTO", name: "Asesoramiento en cirugía plástica", slug: "asesoramiento-cirugia-plastica", description: "Espacio de orientación para resolver tus dudas.", durationMinutes: 45 },
  { category: "ASESORAMIENTO", name: "Asesoramiento estético personalizado", slug: "asesoramiento-estetico", description: "Conversación para definir el camino más adecuado para ti.", durationMinutes: 45 },
];

const gallery = [
  { src: "/images/interior-spa.jpg", alt: "Espacio de descanso con luz natural y vegetación", label: "Nuestro espacio" },
  { src: "/images/facial-cream.jpg", alt: "Tratamiento facial con mascarilla hidratante", label: "Faciales" },
  { src: "/images/still-bottles.jpg", alt: "Frascos de cuidado de la piel en tonos neutros", label: "Rituales" },
  { src: "/images/body-oil.jpg", alt: "Aplicación de aceite durante un tratamiento corporal", label: "Corporales" },
  { src: "/images/interior-bath.jpg", alt: "Espacio de bienestar con bañera de piedra y plantas", label: "Bienestar" },
  { src: "/images/facial-hands.jpg", alt: "Manos de especialista realizando un tratamiento facial", label: "Atención" },
  { src: "/images/still-towel.jpg", alt: "Toalla, cepillo y jabón natural sobre superficie clara", label: "Detalles" },
  { src: "/images/body-stones-2.jpg", alt: "Piedras calientes alineadas sobre la espalda", label: "Calma" },
];

async function main() {
  await prisma.bookingSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  await prisma.siteContent.upsert({ where: { id: "default" }, update: {}, create: { id: "default", content: defaultSiteContent } });

  if ((await prisma.treatment.count()) === 0) {
    await prisma.treatment.createMany({ data: exampleTreatments.map((t, i) => ({ ...t, sortOrder: i })) });
    console.log(`✓ ${exampleTreatments.length} tratamientos de ejemplo creados`);
  }

  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({ data: gallery.map((g, i) => ({ ...g, sortOrder: i })) });
    console.log(`✓ ${gallery.length} imágenes de galería creadas`);
  }

  if (process.env.SEED_DEMO_AVAILABILITY === "true" && (await prisma.availabilityRule.count()) === 0) {
    // Horario de DEMOSTRACIÓN (lunes a sábado). No representa el horario real del centro.
    const rules = [1, 2, 3, 4, 5].flatMap((weekday) => [
      { weekday, startTime: "09:00", endTime: "12:30" },
      { weekday, startTime: "14:00", endTime: "18:00" },
    ]);
    rules.push({ weekday: 6, startTime: "09:00", endTime: "13:00" });
    await prisma.availabilityRule.createMany({ data: rules });
    await prisma.bookingSettings.update({ where: { id: "default" }, data: { onlineBookingActive: true } });
    console.log("⚠ Horario de demostración creado y reserva en línea activada (solo para pruebas)");
  }

  console.log("✓ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
