"use client";

import Image from "next/image";
import { useRef } from "react";
import { ParallaxImage } from "@/components/animations/parallax-image";
import { Reveal } from "@/components/animations/reveal";
import { TextLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { images } from "@/data/images";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function EditorialFeature({ text }: { text: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create("[data-ef-title]", { type: "words" });
        gsap.set(split.words, { opacity: 0.18 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "[data-ef-stage]",
            start: "top top",
            end: "+=140%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          },
        });
        tl.fromTo("[data-ef-frame]", { clipPath: "inset(14% 22% 14% 22%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 })
          .fromTo("[data-ef-frame] img", { scale: 1.25 }, { scale: 1, duration: 1 }, "<")
          .fromTo("[data-ef-shade]", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "<0.3")
          .to(split.words, { opacity: 1, stagger: 0.06, duration: 0.3 }, "<0.2");

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="ef-title" className="relative">
      {/* Escritorio: escena fijada */}
      <div data-ef-stage className="relative hidden h-[100svh] overflow-hidden lg:block">
        <div data-ef-frame className="absolute inset-0">
          <Image src={images.interiorBath.src} alt={images.interiorBath.alt} fill sizes="100vw" className="object-cover" />
          <div data-ef-shade className="absolute inset-0 bg-primary-dark/45" aria-hidden />
        </div>
        <div className="container-x relative flex h-full flex-col items-center justify-center text-center text-background">
          <p className="eyebrow mb-8 text-background/80">La experiencia</p>
          <h2 id="ef-title" data-ef-title className="display-lg max-w-[18ch]">
            Cada detalle importa. <em className="font-light">Cada experiencia también.</em>
          </h2>
        </div>
      </div>

      {/* Móvil/tablet: versión sin fijar */}
      <div className="relative lg:hidden">
        <ParallaxImage src={images.interiorBath.src} alt={images.interiorBath.alt} className="aspect-[4/5] sm:aspect-[16/11]" sizes="100vw" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary-dark/75 via-primary-dark/20 to-transparent">
          <div className="container-x pb-12 text-background">
            <p className="eyebrow mb-5 text-background/80">La experiencia</p>
            <h2 className="display-md max-w-[16ch]">
              Cada detalle importa. <em className="font-light">Cada experiencia también.</em>
            </h2>
          </div>
        </div>
      </div>

      {/* Bloque de texto secundario */}
      <div className="container-x relative grid grid-cols-12 gap-x-6 gap-y-12 py-24 md:py-32">
        <Reveal className="col-span-12 md:col-span-5 lg:col-span-4 lg:col-start-2">
          <div data-reveal-item>
            <SectionLabel number="02">Nuestro ritmo</SectionLabel>
          </div>
          <p data-reveal-item className="mt-8 font-display text-[clamp(1.6rem,2.4vw,2.25rem)] leading-[1.25] text-primary-dark">
            {text}
          </p>
          <div data-reveal-item className="mt-10">
            <TextLink href="/nuestra-experiencia">Vive la experiencia</TextLink>
          </div>
        </Reveal>
        <div className="col-span-10 col-start-3 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-8">
          <ParallaxImage
            src={images.towel.src}
            alt={images.towel.alt}
            reveal
            strength={6}
            className="aspect-[4/5] bg-surface"
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 80vw"
          />
        </div>
      </div>
    </section>
  );
}
