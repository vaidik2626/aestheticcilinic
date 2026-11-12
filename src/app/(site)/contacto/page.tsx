import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { Location } from "@/components/sections/location";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { getSiteContent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { whatsappFor } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Contacto",
  description: `Contacta con el ${site.name}: ${site.address.street}, Bogotá. Reserva en línea o escríbenos por WhatsApp.`,
  path: "/contacto",
});

export default async function ContactPage() {
  const { contact } = await getSiteContent();

  const channels = [
    {
      icon: <CalendarCheck size={26} strokeWidth={1} />,
      title: "Reserva en línea",
      body: "Elige tratamiento, fecha y hora. Te confirmaremos tu cita.",
      cta: "Reservar cita",
      href: "/reservar",
      external: false,
    },
    {
      icon: <WhatsappIcon size={26} />,
      title: "WhatsApp",
      body: `Escríbenos al ${contact.whatsappDisplay} y te responderemos lo antes posible.`,
      cta: "Escribir por WhatsApp",
      href: whatsappFor("general", contact.whatsappPhone),
      external: true,
    },
    {
      icon: <InstagramIcon size={26} strokeWidth={1.1} />,
      title: "Instagram",
      body: `Síguenos en ${site.instagram.handle} para conocer nuestro día a día.`,
      cta: "Ver Instagram",
      href: site.instagram.url,
      external: true,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title={<>Hablemos de <em className="font-light text-primary">tu bienestar.</em></>}
        lead="Estamos en Bogotá. Escríbenos, reserva en línea o visítanos con cita previa."
      />

      <section aria-label="Canales de contacto" className="pb-8">
        <div className="container-x">
          <Reveal as="ul" className="grid gap-px border-y hairline bg-ink/10 md:grid-cols-3" stagger={0.1}>
            {channels.map((c) => {
              const cls = "group flex h-full flex-col bg-background p-8 transition-colors duration-500 hover:bg-surface md:p-10";
              const inner = (
                <>
                  <span className="text-primary">{c.icon}</span>
                  <h2 className="mt-10 font-display text-[2rem] leading-tight">{c.title}</h2>
                  <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink/70">{c.body}</p>
                  <span className="mt-8 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-dark">
                    <span className="link-underline link-underline-static">{c.cta}</span>
                  </span>
                </>
              );
              return (
                <li key={c.title} data-reveal-item>
                  {c.external ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                  ) : (
                    <Link href={c.href} className={cls}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <Location contact={contact} id="ubicacion" number="—" />
    </>
  );
}
