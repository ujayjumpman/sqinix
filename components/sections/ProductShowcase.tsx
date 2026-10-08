"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icon";
import { products } from "@/content/products";

/**
 * "Four ways to power up" - on desktop the section pins and the cards travel sideways
 * as you scroll; on phones/tablets (and reduced motion) it is a native swipe carousel.
 */
export function ProductShowcase() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const dist = () => Math.max(0, t.scrollWidth - window.innerWidth + 64);
        gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${dist() * 1.15}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              if (counter.current) counter.current.textContent = String(Math.min(products.length, Math.floor(self.progress * products.length) + 1)).padStart(2, "0");
            },
          },
        });
        // image drifts a touch against the card travel
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) =>
          gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: pin.current, start: "top top", end: () => `+=${dist() * 1.15}`, scrub: true } })
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="lines" className="relative bg-ink">
      <div ref={pin} className="flex min-h-svh flex-col justify-center overflow-hidden py-24 lg:py-0">
        <div className="container-x flex flex-col justify-between gap-6 pb-10 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">What we supply</p>
            <h2 className="display-2 mt-5 max-w-[14ch]">Four ways to power up.</h2>
          </div>
          <div className="hidden items-center gap-4 lg:flex" aria-hidden>
            <span className="font-mono text-sm tabular-nums text-mute">
              <span ref={counter} className="text-white">
                01
              </span>{" "}
              / {String(products.length).padStart(2, "0")}
            </span>
            <span className="h-px w-40 bg-white/15">
              <span ref={bar} className="block h-px origin-left bg-sky" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>

        <div
          ref={track}
          data-lenis-prevent-touch
          className="flex w-max gap-5 px-4 will-change-transform max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:pb-6 md:px-8 motion-reduce:w-full motion-reduce:snap-x motion-reduce:overflow-x-auto lg:pl-[max(2rem,calc((100vw-90rem)/2+2rem))] lg:pr-16"
        >
          {products.map((p, i) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}/`}
              className="group spotlight relative flex h-[68svh] min-h-[30rem] w-[86vw] shrink-0 snap-center overflow-hidden rounded-[2rem] border border-line bg-ink-2 md:w-[70vw] lg:h-[62svh] lg:w-[min(62vw,62rem)]"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-parallax
                  src={`/media/sequences/${p.sequence}/card.webp`}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-[112%] max-w-none -translate-x-[6%] object-cover transition-transform duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_7_11/0.55)_0%,transparent_40%,rgb(5_7_11/0.9)_100%)]" />
              </div>
              <div className="relative z-10 flex w-full flex-col justify-between p-7 md:p-10">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm tracking-widest text-sky">0{i + 1}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur transition-all duration-500 group-hover:bg-white group-hover:text-ink">
                    <Icon name="arrow-up-right" size={20} />
                  </span>
                </div>
                <div>
                  <h3 className="display-3 max-w-[16ch]">{p.name}</h3>
                  <p className="lead mt-4 max-w-md text-fog/75">{p.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
