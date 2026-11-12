import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { SectionLabel } from "@/components/ui/section-label";
import { treatmentCategories } from "@/data/treatments";
import type { TreatmentCategory } from "@/types/treatment";

export function RelatedExperiences({ current }: { current: TreatmentCategory }) {
  const others = treatmentCategories.filter((c) => c.category !== current);
  return (
    <section aria-labelledby="related-title" className="py-24 md:py-32">
      <div className="container-x">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <SectionLabel>También te puede interesar</SectionLabel>
            <h2 id="related-title" className="display-md mt-6 text-primary-dark">
              Otras <em className="font-light text-primary">experiencias.</em>
            </h2>
          </div>
        </Reveal>
        <Reveal className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6" stagger={0.1}>
          {others.map((c, i) => (
            <Link key={c.slug} href={c.href} data-reveal-item data-cursor="Descubrir" className={`group block ${i === 1 ? "md:mt-16" : ""}`}>
              <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-surface-dark">
                <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 768px) 32vw, 100vw" className="object-cover" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4 border-t hairline pt-5">
                <div>
                  <p className="font-display text-sm italic text-muted">{c.number}</p>
                  <h3 className="mt-1 font-display text-[1.9rem] leading-tight">{c.label}</h3>
                </div>
                <ArrowUpRight size={20} strokeWidth={1.2} className="mt-2 transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
