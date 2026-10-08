"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { process } from "@/content/services";

/** Consult -> Configure -> Deploy -> Support. A line draws across as each step lights up. */
export function ProcessTimeline() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(line.current, { scaleX: 1, scaleY: 1 });
        steps.forEach((s) => s.setAttribute("data-on", "true"));
        return;
      }
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "[data-track]", start: "top 70%", end: "bottom 55%", scrub: 0.5 } });
      });
      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-track]", start: "top 70%", end: "bottom 60%", scrub: 0.5 } });
      });
      steps.forEach((s) =>
        ScrollTrigger.create({ trigger: s, start: "top 68%", onEnter: () => s.setAttribute("data-on", "true"), onLeaveBack: () => s.setAttribute("data-on", "false") })
      );
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-ink py-28 md:py-40">
      <div className="container-x">
        <p className="eyebrow">How we work</p>
        <SplitReveal className="display-2 mt-6 max-w-[14ch]">From first call to first boot.</SplitReveal>

        <div data-track className="relative mt-20 grid gap-12 md:grid-cols-4 md:gap-6">
          {/* line: horizontal on desktop, vertical on phones */}
          <div className="absolute left-[0.55rem] top-2 h-[calc(100%-1rem)] w-px bg-white/10 md:left-0 md:top-[0.55rem] md:h-px md:w-full">
            <div ref={line} className="h-full w-full origin-top bg-gradient-to-b from-sky to-violet md:origin-left md:bg-gradient-to-r" />
          </div>
          {process.map((s) => (
            <div key={s.n} data-step data-on="false" className="group relative pl-10 transition-opacity duration-700 data-[on=false]:opacity-35 md:pl-0 md:pt-12">
              <span className="absolute left-0 top-1 h-[1.1rem] w-[1.1rem] rounded-full border border-white/25 bg-ink transition-all duration-700 group-data-[on=true]:border-sky group-data-[on=true]:bg-sky group-data-[on=true]:shadow-[0_0_0_6px_rgb(82_184_236/0.18),0_0_30px_var(--color-sky)] md:top-0" />
              <p className="font-mono text-sm tracking-widest text-sky">{s.n}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 max-w-[18rem] leading-relaxed text-mute">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
