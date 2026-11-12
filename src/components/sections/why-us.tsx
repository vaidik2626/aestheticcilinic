import { HandHeart, HeartHandshake, Leaf, Sparkles } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { SectionLabel } from "@/components/ui/section-label";

/**
 * Pilares del centro. Son descripciones del enfoque de atención, no cifras ni
 * certificaciones. Revisa con el centro antes de publicar cualquier afirmación nueva.
 */
const pillars = [
  {
    icon: HandHeart,
    title: "Atención personalizada",
    body: "Cada tratamiento parte de escucharte y de una valoración individual.",
  },
  {
    icon: Leaf,
    title: "Enfoque integral",
    body: "Faciales, corporales, postoperatorios y asesoramiento bajo una misma mirada.",
  },
  {
    icon: HeartHandshake,
    title: "Acompañamiento profesional",
    body: "Especialistas en postoperatorios, siempre en coordinación con tu médico.",
  },
  {
    icon: Sparkles,
    title: "Centrado en el bienestar",
    body: "Un espacio sereno, sin prisas, donde tu experiencia también importa.",
  },
];

export function WhyUs() {
  return (
    <section aria-labelledby="why-title" className="relative border-y hairline bg-background py-24 md:py-32">
      <div className="container-x">
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
          <Reveal className="col-span-12 lg:col-span-4">
            <div data-reveal-item>
              <SectionLabel number="04">Por qué elegirnos</SectionLabel>
            </div>
            <h2 data-reveal-item id="why-title" className="display-md mt-8 max-w-[12ch] text-primary-dark">
              Cuidado con <em className="font-light text-primary">intención.</em>
            </h2>
          </Reveal>

          <Reveal className="col-span-12 grid sm:grid-cols-2 lg:col-span-8" stagger={0.1}>
            {pillars.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                data-reveal-item
                className={`group relative border-t hairline py-10 sm:px-8 ${i % 2 === 1 ? "sm:border-l" : "sm:pl-0"}`}
              >
                <div className="flex items-start justify-between">
                  <Icon size={26} strokeWidth={1} className="text-primary transition-transform duration-700 ease-expo group-hover:-translate-y-1" aria-hidden />
                  <span className="font-display text-sm italic text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-[1.9rem] leading-tight">{title}</h3>
                <p className="mt-3 max-w-xs text-[0.92rem] leading-relaxed text-ink/70">{body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
