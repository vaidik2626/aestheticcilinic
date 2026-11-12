import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderNote } from "@/components/ui/section-label";

export function LegalPage({ title, lead, sections }: { title: string; lead: string; sections: { heading: string; body: string[] }[] }) {
  return (
    <>
      <PageHeader eyebrow="Información legal" title={title} lead={lead} />
      <section className="pb-28 md:pb-36">
        <div className="container-x grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-7 lg:col-start-4">
            <PlaceholderNote className="mb-12">
              Plantilla orientativa: debe ser revisada y aprobada por el centro y su asesor legal antes de publicarse.
            </PlaceholderNote>
            <div className="space-y-12">
              {sections.map((s, i) => (
                <article key={s.heading} className="border-t hairline pt-8">
                  <h2 className="font-display text-[1.9rem] leading-tight text-primary-dark">
                    <span className="mr-3 text-lg italic text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {s.heading}
                  </h2>
                  <div className="mt-5 space-y-4 text-[0.98rem] leading-[1.8] text-ink/75">
                    {s.body.map((p) => (
                      <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
