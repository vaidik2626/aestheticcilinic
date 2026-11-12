"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import type { TreatmentCategoryContent } from "@/data/treatments";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroComplete } from "@/lib/intro";

export type HeroVariant = "split" | "fullbleed" | "framed" | "editorial";

/** Hero cinematográfico para cada página de tratamiento, con cuatro composiciones distintas. */
export function TreatmentHero({ content, variant }: { content: TreatmentCategoryContent; variant: HeroVariant }) {
  const root = useRef<HTMLElement>(null);
  const { hero, image, detailImage } = content;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      if (prefersReducedMotion()) return;

      const split = SplitText.create(q("[data-th-title]"), { type: "lines", mask: "lines", linesClass: "pb-[0.06em] -mb-[0.06em]" });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      gsap.set(split.lines, { yPercent: 115 });
      gsap.set(q("[data-th-fade]"), { autoAlpha: 0, y: 20 });
      gsap.set(q("[data-th-img]"), { clipPath: variant === "fullbleed" ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" });
      gsap.set(q("[data-th-img] img"), { scale: 1.2 });

      tl.to(q("[data-th-img]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" })
        .to(q("[data-th-img] img"), { scale: 1, duration: 2.2 }, "<")
        .to(split.lines, { yPercent: 0, duration: 1.5, stagger: 0.09 }, "<0.4")
        .to(q("[data-th-fade]"), { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, "<0.3");

      const off = onIntroComplete(() => tl.play());

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.to(q("[data-th-parallax]"), {
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      return () => {
        off();
        split.revert();
        mm.revert();
      };
    },
    { scope: root },
  );

  const breadcrumb = (light = false) => (
    <nav aria-label="Ruta de navegación" data-reveal data-th-fade className={`eyebrow flex gap-2 ${light ? "text-background/70" : "text-muted"}`}>
      <Link href="/" className="link-underline">Inicio</Link>
      <span aria-hidden>/</span>
      <Link href="/tratamientos" className="link-underline">Tratamientos</Link>
    </nav>
  );

  const title = (cls: string) => (
    <h1 data-reveal data-th-title className={cls}>
      {hero.title} <em className="font-light">{hero.titleAccent}</em>
    </h1>
  );

  const ctas = (light = false) => (
    <div data-reveal data-th-fade className="flex flex-col gap-3 sm:flex-row">
      <ButtonLink href={`/reservar?categoria=${content.category}`} variant={light ? "light" : "primary"}>
        Reservar cita
      </ButtonLink>
      <ButtonLink href="#informacion" variant={light ? "outline-light" : "outline"} icon={false}>
        Más información
      </ButtonLink>
    </div>
  );

  if (variant === "fullbleed") {
    return (
      <section ref={root} data-header-theme="dark" className="relative flex min-h-[100svh] items-end overflow-hidden bg-primary-dark text-background">
        <div data-reveal data-th-img className="absolute inset-0">
          <div data-th-parallax className="absolute inset-x-0 -inset-y-[8%]">
            <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/45 to-primary-dark/25" aria-hidden />
        <div className="container-x relative pb-16 pt-40 md:pb-24">
          {breadcrumb(true)}
          <p data-reveal data-th-fade className="eyebrow mt-10 text-accent">{hero.eyebrow}</p>
          {title("display-xl mt-6 max-w-[13ch]")}
          <div className="mt-12 flex flex-col gap-10 border-t border-background/20 pt-10 md:flex-row md:items-end md:justify-between">
            <p data-reveal data-th-fade className="max-w-md text-lg leading-relaxed text-background/85">{hero.lead}</p>
            {ctas(true)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "framed") {
    return (
      <section ref={root} className="relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)]">
        <div className="container-x text-center">
          <div className="flex justify-center">{breadcrumb()}</div>
          <p data-reveal data-th-fade className="eyebrow mt-10 text-primary">{hero.eyebrow}</p>
          {title("display-lg mx-auto mt-6 max-w-[16ch] text-primary-dark")}
          <p data-reveal data-th-fade className="lead mx-auto mt-8 max-w-xl">{hero.lead}</p>
          <div className="mt-10 flex justify-center">{ctas()}</div>
        </div>
        <div className="container-x mt-16 md:mt-24">
          <div data-reveal data-th-img className="relative mx-auto aspect-[16/10] max-w-6xl overflow-hidden bg-surface-dark md:aspect-[21/9]">
            <div data-th-parallax className="absolute inset-x-0 -inset-y-[8%]">
              <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1280px) 72rem, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "editorial") {
    return (
      <section ref={root} className="relative overflow-hidden pt-[calc(var(--header-h)+2rem)]">
        <div className="container-x grid grid-cols-12 gap-x-6 gap-y-12 pb-16 md:pb-24">
          <div className="col-span-12 lg:col-span-8">
            {breadcrumb()}
            <p data-reveal data-th-fade className="eyebrow mt-10 text-primary">{hero.eyebrow}</p>
            {title("display-xl mt-6 max-w-[14ch] text-primary-dark lg:text-[clamp(3.5rem,7vw,7.5rem)]")}
          </div>
          <div className="col-span-12 flex flex-col justify-end gap-8 lg:col-span-4">
            <p data-reveal data-th-fade className="lead">{hero.lead}</p>
            {ctas()}
          </div>
          <div className="relative col-span-12 grid grid-cols-12 gap-6">
            <div data-reveal data-th-img className="relative col-span-12 aspect-[16/9] overflow-hidden bg-surface-dark md:col-span-8">
              <div data-th-parallax className="absolute inset-x-0 -inset-y-[8%]">
                <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover object-[50%_30%]" />
              </div>
            </div>
            <div data-reveal data-th-img className="relative col-span-6 col-start-7 -mt-24 aspect-[3/4] overflow-hidden border-[6px] border-background bg-surface md:col-span-3 md:col-start-10 md:mt-24">
              <Image src={detailImage.src} alt={detailImage.alt} fill sizes="25vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // split
  return (
    <section ref={root} className="relative overflow-hidden pt-[var(--header-h)]">
      <div className="container-x grid min-h-[calc(100svh-var(--header-h))] grid-cols-12 gap-x-6 gap-y-12 py-10">
        <div className="col-span-12 flex flex-col justify-center lg:col-span-6">
          {breadcrumb()}
          <p data-reveal data-th-fade className="eyebrow mt-10 text-primary">{hero.eyebrow}</p>
          {title("display-xl mt-6 max-w-[10ch] text-primary-dark lg:text-[clamp(3.5rem,7vw,8rem)]")}
          <p data-reveal data-th-fade className="lead mt-8 max-w-md">{hero.lead}</p>
          <div className="mt-10">{ctas()}</div>
        </div>
        <div className="relative col-span-12 lg:col-span-5 lg:col-start-8">
          <div data-reveal data-th-img className="relative aspect-[4/5] h-full w-full overflow-hidden bg-surface-dark lg:aspect-auto">
            <div data-th-parallax className="absolute inset-x-0 -inset-y-[8%]">
              <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
            </div>
          </div>
          <span data-reveal data-th-fade className="absolute -left-4 bottom-10 hidden font-display text-[9rem] italic leading-none text-primary/20 lg:block" aria-hidden>
            {content.number}
          </span>
        </div>
      </div>
    </section>
  );
}
