import { Footer } from "@/components/footer/footer";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { Preloader } from "@/components/layout/preloader";
import { FloatingActions, ScrollProgress } from "@/components/layout/site-extras";
import { Header } from "@/components/navigation/header";
import { JsonLd } from "@/components/ui/json-ld";
import { SmoothScrollProvider } from "@/hooks/use-lenis";
import { getSiteContent } from "@/lib/data";
import { localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { contact } = await getSiteContent();

  return (
    <SmoothScrollProvider>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-primary-dark focus:px-4 focus:py-2 focus:text-background"
      >
        Saltar al contenido
      </a>
      <Preloader />
      <ScrollProgress />
      <Header whatsappPhone={contact.whatsappPhone} />
      <main id="contenido">{children}</main>
      <Footer whatsappPhone={contact.whatsappPhone} whatsappDisplay={contact.whatsappDisplay} />
      <FloatingActions whatsappPhone={contact.whatsappPhone} />
      <CustomCursor />
      <JsonLd data={localBusinessJsonLd(contact.whatsappPhone)} />
    </SmoothScrollProvider>
  );
}
