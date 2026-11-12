import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { AboutClaudia } from "@/components/sections/about-claudia";
import { BookingCta } from "@/components/sections/booking-cta";
import { EditorialFeature } from "@/components/sections/editorial-feature";
import { GallerySection } from "@/components/sections/gallery-section";
import { Intro } from "@/components/sections/intro";
import { Location } from "@/components/sections/location";
import { Testimonials } from "@/components/sections/testimonials";
import { TreatmentExperience } from "@/components/sections/treatment-experience";
import { WhyUs } from "@/components/sections/why-us";
import { getGallery, getSiteContent, getTestimonials } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Centro estético en Bogotá",
    description: site.description,
    path: "/",
  }),
  title: { absolute: `${site.name} | Centro estético en Bogotá` },
};

export default async function HomePage() {
  const [content, gallery, testimonials] = await Promise.all([getSiteContent(), getGallery(), getTestimonials()]);

  return (
    <>
      <Hero headline={content.home.heroHeadline} text={content.home.heroText} />
      <Intro headline={content.home.introHeadline} body={content.home.introBody} />
      <TreatmentExperience />
      <EditorialFeature text={content.home.editorialText} />
      <AboutClaudia about={content.about} />
      <WhyUs />
      <GallerySection items={gallery} />
      <Testimonials items={testimonials} />
      <BookingCta whatsappPhone={content.contact.whatsappPhone} />
      <Location contact={content.contact} />
    </>
  );
}
