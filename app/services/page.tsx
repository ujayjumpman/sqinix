import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ServicesScroller } from "@/components/sections/ServicesScroller";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "IT consulting & software services",
  description: "IT strategy consulting, custom application development, digital transformation and business process consulting from Squinix Solutions, Noida West.",
  alternates: { canonical: "/services/" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Consulting that works as hard as the hardware." lead="Strategy, software and process: four ways we help businesses get more from their technology.">
        <div className="flex flex-wrap gap-3">
          <Button href="#strategy">See the services</Button>
          <Button href="#quote" variant="ghost" arrow={false}>
            Talk to us
          </Button>
        </div>
      </PageHero>
      <ServicesScroller />
      <ProcessTimeline />
      <QuoteSection title="Let's map it out." defaultInterest="IT consulting" />
    </>
  );
}
