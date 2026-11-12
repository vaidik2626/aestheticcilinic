import type { Metadata } from "next";
import { TreatmentPage } from "@/components/treatments/treatment-page";
import { categoryByKey } from "@/data/treatments";
import { pageMetadata } from "@/lib/seo";

const content = categoryByKey.POSTOPERATORIO;

export const metadata: Metadata = pageMetadata({
  title: content.seo.title,
  description: content.seo.description,
  path: content.href,
  image: content.image.src,
});

export default function Page() {
  return <TreatmentPage content={content} layout={{ hero: "framed", information: "split", process: "timeline", suitabilityFirst: true }} />;
}
