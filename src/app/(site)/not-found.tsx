import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { images } from "@/data/images";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-[var(--header-h)]">
      <div className="container-x grid grid-cols-12 items-center gap-x-6 gap-y-12 py-16">
        <div className="col-span-12 md:col-span-6">
          <p className="eyebrow text-primary">Error 404</p>
          <h1 className="display-xl mt-6 text-primary-dark">
            Esta página <em className="font-light text-primary">se tomó un respiro.</em>
          </h1>
          <p className="lead mt-8 max-w-md">
            La página que buscas no existe o cambió de lugar. Te invitamos a volver al inicio o descubrir nuestros tratamientos.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ButtonLink href="/">Volver al inicio</ButtonLink>
            <TextLink href="/tratamientos">Ver tratamientos</TextLink>
          </div>
        </div>
        <div className="relative col-span-10 col-start-2 aspect-[4/5] overflow-hidden bg-surface md:col-span-5 md:col-start-8">
          <Image src={images.towel.src} alt={images.towel.alt} fill sizes="40vw" className="object-cover" />
          <span className="absolute bottom-4 left-4 font-display text-8xl italic leading-none text-background/90">404</span>
        </div>
      </div>
    </section>
  );
}
