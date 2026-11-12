import type { Metadata } from "next";
import { deleteGalleryImage, deleteTestimonial } from "@/app/admin/actions";
import { GalleryForm, SiteContentForm, TestimonialForm } from "@/app/admin/(panel)/contenido/forms";
import { ConfirmButton } from "@/components/admin/form";
import { AdminPageTitle, Panel } from "@/components/admin/page-title";
import { parseSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Contenido" };

export default async function ContentPage() {
  const [row, gallery, testimonials] = await Promise.all([
    prisma.siteContent.findUnique({ where: { id: "default" } }),
    prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);
  const content = parseSiteContent(row?.content);

  return (
    <>
      <AdminPageTitle title="Contenido del sitio" description="Textos, datos de contacto, galería y testimonios. Los cambios se publican al guardar." />

      <div className="space-y-8">
        <Panel title="Textos y contacto">
          <SiteContentForm value={content} />
        </Panel>

        <Panel title={`Galería (${gallery.length})`}>
          <p className="mb-5 text-xs text-muted">
            Sube las fotografías a <code>/public/images</code> (o a un almacenamiento con URL https) y añade aquí su ruta. Si no hay imágenes visibles se muestra la galería por defecto.
          </p>
          <ul className="mb-6 divide-y divide-ink/10">
            {gallery.map((g) => (
              <li key={g.id} className="py-4">
                <GalleryForm value={g} />
                <form action={deleteGalleryImage} className="mt-2">
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton message="¿Eliminar esta imagen de la galería?">Eliminar</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
          <div className="border-t hairline pt-5">
            <p className="mb-3 text-sm font-semibold">Añadir imagen</p>
            <GalleryForm />
          </div>
        </Panel>

        <Panel title={`Testimonios (${testimonials.length})`}>
          <p className="mb-5 text-xs text-muted">
            Publica únicamente testimonios reales, con el nombre de pila y la autorización expresa de la clienta. Sin testimonios publicados, la web muestra un marcador identificado como contenido de demostración.
          </p>
          <ul className="mb-6 divide-y divide-ink/10">
            {testimonials.map((t) => (
              <li key={t.id} className="py-4">
                <TestimonialForm value={t} />
                <form action={deleteTestimonial} className="mt-2">
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton message="¿Eliminar este testimonio?">Eliminar</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
          <div className="border-t hairline pt-5">
            <p className="mb-3 text-sm font-semibold">Nuevo testimonio</p>
            <TestimonialForm />
          </div>
        </Panel>
      </div>
    </>
  );
}
