"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LoopVideo } from "@/components/media/LoopVideo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { whenReady } from "@/lib/ready";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const intro = content.current!.querySelectorAll("[data-intro]");
      if (reduce) {
        gsap.set(intro, { opacity: 1, y: 0 });
        gsap.set(cue.current, { opacity: 1 });
        return;
      }
      // The copy ships visible in the HTML (fast first paint / LCP) while the preloader covers it;
      // here we tuck it away just before the intro lifts.
      gsap.set(intro, { opacity: 0, y: 28 });
      // entrance, after the preloader lifts
      void whenReady().then(() => {
        gsap.to(intro, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, delay: 0.55, ease: "expo.out" });
        gsap.to(cue.current, { opacity: 1, duration: 1, delay: 1.4 });
        gsap.fromTo(media.current, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "expo.out" });
      });
      // scroll-out: the film zooms and dims while the copy lifts away
      gsap.to(media.current, {
        yPercent: 12,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(content.current, {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      <div ref={media} className="absolute inset-0 will-change-transform">
        <LoopVideo name="hero" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(5_7_11/0.88)_0%,rgb(5_7_11/0.45)_45%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink via-ink/70 to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />

      <div ref={content} className="container-x relative z-10 flex h-full flex-col justify-end pb-[17svh] pt-28 md:justify-center md:pb-0">
        <p data-intro className="eyebrow">
          IT hardware · Gaming · Infrastructure
        </p>
        <SplitReveal as="h1" trigger="load" delay={0.2} className="display-1 mt-6 max-w-[11ch]">
          Hardware that performs.
        </SplitReveal>
        <p data-intro className="lead mt-7 max-w-xl !text-fog/90 [text-shadow:0_1px_24px_rgb(5_7_11/0.9)]">
          Gaming rigs, business computers, servers and networking, plus the IT consulting to put them to work. Configured, delivered and supported from Noida West.
        </p>
        <div data-intro className="mt-9 flex flex-wrap gap-3">
          <Button href="#lines">Explore hardware</Button>
          <Button href="/contact/#quote" variant="ghost" arrow={false}>
            Get a quote
          </Button>
        </div>
      </div>

      <div ref={cue} className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 opacity-0 md:flex">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-mute">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[float-y_1.8s_ease-in-out_infinite] bg-sky" />
        </span>
      </div>
      <Icon name="down" className="sr-only" />
    </section>
  );
}
