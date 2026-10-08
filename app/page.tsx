import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { ScrollSequence, type SequenceBeat } from "@/components/motion/ScrollSequence";
import { WordHighlight } from "@/components/motion/WordHighlight";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: { absolute: "Squinix | IT hardware, gaming PCs & consulting in Noida" },
  alternates: { canonical: "/" },
};

// TODO(client): the build-and-test claims below describe a typical premium build process.
// Confirm they match what Squinix actually does (see CONTENT-CHECKLIST.md).
const rigBeats: SequenceBeat[] = [
  { from: 0, to: 0.22, align: "left", eyebrow: "Built, not assembled", title: "Every part, chosen.", body: "We match components to your workload, not to the margin." },
  { from: 0.25, to: 0.49, align: "right", eyebrow: "By hand", title: "Assembled with care.", body: "Clean routing, tuned airflow and every cable in its place." },
  { from: 0.52, to: 0.77, align: "left", eyebrow: "Powered on", title: "Tested before it ships.", body: "Burn-in and stress runs, so problems show up on our bench, not your desk." },
  {
    from: 0.8,
    to: 1,
    align: "center",
    eyebrow: "Ready to run",
    title: "Delivered, installed, supported.",
    body: "One team from the first call to the first boot.",
    cta: <Button href="/products/gaming/">See gaming PCs</Button>,
  },
];

const serverBeats: SequenceBeat[] = [
  { from: 0, to: 0.46, align: "left", eyebrow: "Infrastructure", title: "Down the aisle, everything on.", body: "Servers, storage and networking, planned as one system." },
  {
    from: 0.52,
    to: 1,
    align: "right",
    eyebrow: "Always on",
    title: "Built to stay up.",
    body: "Redundancy, monitoring and support for the machines your business can't switch off.",
    cta: <Button href="/products/infrastructure/">Explore infrastructure</Button>,
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />

      <section className="relative bg-ink py-32 md:py-52">
        <div className="container-x">
          <p className="eyebrow">What we do</p>
          <WordHighlight
            className="display-3 mt-8 max-w-[26ch] !font-medium !tracking-[-0.03em] md:!text-[clamp(2rem,4.4vw,4.4rem)]"
            text="We don't just resell hardware. We configure, deploy and support the machines your business and your play depend on."
          />
        </div>
      </section>

      <ScrollSequence name="rig" label="A gaming PC assembling itself" beats={rigBeats} scrollVh={640} />

      <ProductShowcase />

      <ScrollSequence name="servers" label="A walk through a data-centre aisle" beats={serverBeats} scrollVh={400} />

      <ServicesBento />
      <ProcessTimeline />
      <Testimonials />
      <QuoteSection />
    </>
  );
}
