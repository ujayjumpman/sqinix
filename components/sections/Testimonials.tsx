"use client";

import { useEffect, useRef, useState } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { testimonials } from "@/content/testimonials";

const initials = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Snap-scrolling quote carousel with auto-advance (pauses on hover/focus and when off-screen). */
export function Testimonials() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const visible = useRef(false);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const n = testimonials.length;
    const next = (i + n) % n;
    const card = el.children[next] as HTMLElement;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 0, behavior: "smooth" });
    setIndex(next);
  };

  useEffect(() => {
    const el = scroller.current!;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const onScroll = () => {
      const w = (el.children[0] as HTMLElement).offsetWidth + 20;
      setIndex(Math.round(el.scrollLeft / w));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const id = window.setInterval(() => {
      if (paused.current || !visible.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const w = (el.children[0] as HTMLElement).offsetWidth + 20;
      const cur = Math.round(el.scrollLeft / w);
      const n = testimonials.length;
      el.scrollTo({ left: ((cur + 1) % n) * w, behavior: "smooth" });
    }, 6500);
    return () => {
      io.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.clearInterval(id);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-brand/10 blur-[120px]" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Client words</p>
            <SplitReveal className="display-2 mt-6 max-w-[14ch]">Trusted by the people who use it.</SplitReveal>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line text-fog transition-colors hover:border-sky hover:bg-white/5">
              <Icon name="arrow" size={18} className="rotate-180" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line text-fog transition-colors hover:border-sky hover:bg-white/5">
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>

        <Reveal className="mt-14">
          <div
            ref={scroller}
            data-lenis-prevent-touch
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
            onFocus={() => (paused.current = true)}
            onBlur={() => (paused.current = false)}
            role="region"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Client testimonials"
          >
            {testimonials.map((t) => (
              <figure key={t.name} className="relative flex w-[88%] shrink-0 snap-start flex-col justify-between rounded-[1.75rem] border border-line bg-ink p-8 md:w-[calc(50%-10px)] md:p-10 lg:w-[calc(40%-10px)]">
                <svg aria-hidden viewBox="0 0 32 24" className="h-7 w-9 text-sky/70" fill="currentColor">
                  <path d="M0 24V14.2C0 6.3 4.6 1.2 12 0l1.2 3.6C9.3 4.8 7.4 7.3 7.2 10.8H13V24H0Zm19 0V14.2C19 6.3 23.600 1.200 31 0l1.200 3.600c-3.900 1.200-5.800 3.700-6 7.200H32V24H19Z" />
                </svg>
                <blockquote className="mt-6 text-[1.12rem] leading-[1.6] tracking-tight text-fog/90">{t.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky to-navy font-mono text-sm font-semibold text-white">{initials(t.name)}</span>
                  <span>
                    <span className="block font-medium text-white">{t.name}</span>
                    <span className="block text-sm text-mute">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 flex gap-2" aria-hidden>
          {testimonials.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-sky" : "w-4 bg-white/15"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
