import type { ReactNode } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

/** Shared hero for inner pages: glow, faint grid, big split-text headline. */
export function PageHero({ eyebrow, title, lead, children, tall = false }: { eyebrow: string; title: string; lead?: string; children?: ReactNode; tall?: boolean }) {
  return (
    <section className={`relative isolate overflow-hidden bg-ink pb-24 pt-44 md:pb-32 md:pt-56 ${tall ? "md:min-h-[88svh]" : ""}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[46rem] w-[46rem] rounded-full bg-brand/20 blur-[140px]" />
        <div className="absolute -left-52 top-1/2 h-[34rem] w-[34rem] rounded-full bg-violet/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(rgb(255 255 255/0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255/0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(70% 70% at 70% 30%, #000, transparent)",
            WebkitMaskImage: "radial-gradient(70% 70% at 70% 30%, #000, transparent)",
          }}
        />
      </div>
      <div className="container-x">
        <p className="eyebrow">{eyebrow}</p>
        <SplitReveal as="h1" trigger="load" delay={0.5} className="display-1 mt-7 max-w-[14ch]">
          {title}
        </SplitReveal>
        {lead && (
          <Reveal className="mt-8 max-w-2xl" delay={0.85}>
            <p className="lead">{lead}</p>
          </Reveal>
        )}
        {children && (
          <Reveal className="mt-10" delay={1}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
