"use client";

import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Monogram } from "@/components/ui/logo";
import { images } from "@/data/images";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroComplete } from "@/lib/intro";
import { site } from "@/lib/site";

function splitHeadline(text: string) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return { lead: words.join(" "), last };
}

export function Hero({ headline, text }: { headline: string; text: string }) {
  const root = useRef<HTMLElement>(null);
  const { lead, last } = splitHeadline(headline);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reveal = q("[data-reveal]");

      if (prefersReducedMotion()) {
        gsap.set(reveal, { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });

      gsap.set(reveal, { autoAlpha: 1 });
      gsap.set("[data-hero-image]", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set("[data-hero-image] img", { scale: 1.25 });
      gsap.set("[data-hero-detail]", { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 24 });
      gsap.set("[data-hero-badge]", { autoAlpha: 0, scale: 0.6, rotate: -40 });

      const split = SplitText.create("[data-hero-title]", { type: "lines", mask: "lines", linesClass: "pb-[0.06em] -mb-[0.06em]" });
      gsap.set(split.lines, { yPercent: 115 });

      tl.to("[data-hero-image]", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" })
        .to("[data-hero-image] img", { scale: 1, duration: 2.4 }, "<0.2")
        .to(split.lines, { yPercent: 0, duration: 1.6, stagger: 0.1 }, "<0.5")
        .to("[data-hero-detail]", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }, "<0.3")
        .to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.09 }, "<0.3")
        .to("[data-hero-badge]", { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.6 }, "<0.1");

      const off = onIntroComplete(() => tl.play());

      // Parallax sutil al salir del hero (solo escritorio).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.to("[data-hero-parallax-img]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-parallax-text]", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-detail-wrap]", {
          yPercent: -40,
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

  return (
    <section
      ref={root}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]"
    >
      <div className="container-x relative grid flex-1 grid-cols-12 gap-x-6 pb-10 pt-8 lg:pb-14 lg:pt-6">
        {/* Columna de texto */}
        <div data-hero-parallax-text className="relative z-10 col-span-12 flex flex-col lg:col-span-7 lg:pt-[3vh]">
          <p data-reveal data-hero-fade className="eyebrow flex items-center gap-3 text-primary">
            <span className="inline-block h-px w-8 bg-primary/50" aria-hidden />
            Centro Estético · Bogotá
          </p>

          <h1
            id="hero-title"
            data-reveal
            data-hero-title
            className="display-xl mt-8 max-w-[11ch] text-primary-dark lg:mt-8 lg:max-w-[12ch] lg:text-[clamp(4rem,min(7.4vw,12.5vh),9rem)]"
          >
            {lead} <em className="font-light text-primary">{last}</em>
          </h1>

          <div className="mt-auto hidden pt-8 lg:block">
            <p data-reveal data-hero-fade className="lead max-w-md">
              {text}
            </p>
            <div data-reveal data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/tratamientos">Descubrir tratamientos</ButtonLink>
              <ButtonLink href="/reservar" variant="outline">
                Reservar una cita
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Composición de imagen */}
        <div className="relative col-span-12 mt-10 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <div
            data-reveal
            data-hero-image
            className="relative aspect-[4/5] w-full overflow-hidden bg-surface-dark lg:absolute lg:inset-y-0 lg:aspect-auto lg:h-full"
          >
            <div data-hero-parallax-img className="absolute inset-x-0 -inset-y-[8%]">
              <Image
                src={images.hero.src}
                alt={images.hero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-[50%_30%]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/35 via-transparent to-primary-dark/5" aria-hidden />
            <p data-reveal data-hero-fade className="eyebrow absolute bottom-5 right-5 text-background/85">
              Ritual de piel · 01
            </p>
          </div>

          {/* Imagen de detalle superpuesta */}
          <div
            data-hero-detail-wrap
            className="absolute -bottom-6 -left-2 w-[38%] sm:w-[30%] lg:-left-[34%] lg:bottom-[8%] lg:w-[44%]"
          >
            <div data-reveal data-hero-detail className="relative aspect-[3/4] overflow-hidden border-[6px] border-background bg-surface shadow-[0_30px_60px_-30px_rgba(60,48,42,0.45)]">
              <Image src={images.heroDetail.src} alt={images.heroDetail.alt} fill priority sizes="(min-width: 1024px) 18vw, 35vw" className="object-cover" />
            </div>
          </div>

          {/* Distintivo giratorio con monograma */}
          <div
            data-reveal
            data-hero-badge
            className="absolute -top-8 right-4 size-28 text-primary-dark sm:size-32 lg:-left-16 lg:right-auto lg:top-[12%]"
            aria-hidden
          >
            <svg viewBox="0 0 120 120" className="animate-spin-slow absolute inset-0 size-full">
              <defs>
                <path id="hero-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <circle cx="60" cy="60" r="59" fill="var(--background)" />
              <text fontSize="8.6" letterSpacing="3.2" fill="currentColor" fontFamily="var(--font-manrope)" fontWeight="600">
                <textPath href="#hero-circle">CENTRO ESTÉTICO · CLAUDIA HERNÁNDEZ ·</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Monogram size={46} />
            </div>
          </div>
        </div>

        {/* Texto y CTAs en móvil/tablet */}
        <div className="col-span-12 mt-14 lg:hidden">
          <p data-reveal data-hero-fade className="lead max-w-md">
            {text}
          </p>
          <div data-reveal data-hero-fade className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tratamientos" magnetic={false}>
              Descubrir tratamientos
            </ButtonLink>
            <ButtonLink href="/reservar" variant="outline" magnetic={false}>
              Reservar una cita
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Pie del hero: indicador de scroll y ubicación */}
      <div className="container-x relative hidden items-end justify-between pb-8 lg:flex">
        <a href="#bienvenida" data-reveal data-hero-fade className="group flex items-center gap-4 text-muted">
          <span className="relative block h-12 w-px overflow-hidden bg-ink/10">
            <span className="animate-scroll-line absolute inset-0 bg-primary-dark" />
          </span>
          <span className="eyebrow transition-colors group-hover:text-ink">Desliza</span>
        </a>
        <p data-reveal data-hero-fade className="eyebrow text-muted">
          {site.address.street} — {site.address.city}
        </p>
      </div>
    </section>
  );
}
