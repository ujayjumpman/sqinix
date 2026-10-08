"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { products, type ProductLine } from "@/content/products";

const spot = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/** Sticky sub-navigation (Overview / Highlights / Range / Why us / Quote) with scroll-spy. */
export function LocalNav({ product }: { product: ProductLine }) {
  const [active, setActive] = useState("highlights");
  const items = [
    { id: "highlights", label: "Highlights" },
    { id: "range", label: "Range" },
    { id: "why", label: "Why Squinix" },
  ];

  useEffect(() => {
    const triggers = [...items.map((i) => i.id), "quote"].map((id) =>
      ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(id) })
    );
    return () => triggers.forEach((t) => t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sticky top-[var(--nav-h,0px)] z-30 border-b border-line bg-ink/75 backdrop-blur-xl transition-[top] duration-500">
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <p className="hidden text-[0.95rem] font-medium text-white sm:block">{product.name}</p>
        <nav aria-label={`${product.short} sections`} className="-mx-2 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((i) => (
            <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${active === i.id ? "bg-white/10 text-white" : "text-mute hover:text-white"}`}>
              {i.label}
            </a>
          ))}
        </nav>
        <Button href="#quote" className="!px-4 !py-2 text-sm" arrow={false}>
          Get a quote
        </Button>
      </div>
    </div>
  );
}

export function Highlights({ product }: { product: ProductLine }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.current!.querySelectorAll(".reveal-init").forEach((n) => n.classList.remove("reveal-init"));
        return;
      }
      gsap.fromTo(
        root.current!.querySelectorAll("[data-tile]"),
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.08,
          ease: "expo.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: root.current!.querySelector("[data-tiles]"), start: "top 85%", once: true },
          onStart: () => root.current!.querySelectorAll("[data-tile]").forEach((n) => n.classList.remove("reveal-init")),
        }
      );
    },
    { scope: root }
  );
  return (
    <section ref={root} id="highlights" className="relative scroll-mt-28 bg-ink py-28 md:py-40">
      <div className="container-x">
        <p className="eyebrow">{product.short}</p>
        <SplitReveal className="display-2 mt-6 max-w-[16ch]">What&apos;s on the shelf.</SplitReveal>
        <p className="lead mt-6 max-w-xl">{product.summary}</p>
        <div data-tiles className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {product.highlights.map((h) => (
            <article key={h.title} data-tile onPointerMove={spot} className="reveal-init spotlight group relative flex min-h-[15rem] flex-col justify-between rounded-[1.5rem] border border-line bg-ink-2 p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.04] text-sky transition-all duration-500 group-hover:border-sky/50 group-hover:bg-sky/10">
                <Icon name={h.icon} size={22} />
              </span>
              <div className="mt-10">
                <h3 className="text-xl font-semibold tracking-tight text-white">{h.title}</h3>
                <p className="mt-2 leading-relaxed text-mute">{h.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Configs({ product }: { product: ProductLine }) {
  return (
    <section id="range" className="relative scroll-mt-28 overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />
      <div className="container-x relative">
        <p className="eyebrow">The range</p>
        <SplitReveal className="display-2 mt-6 max-w-[16ch]">{product.configsTitle}.</SplitReveal>
        <p className="lead mt-6 max-w-xl">Indicative starting points, not fixed packages. Tell us what you need and we&apos;ll configure around it. All pricing is on request.</p>
        <Reveal stagger={0.1} className="mt-16 grid gap-4 lg:grid-cols-3">
          {product.configs.map((c, i) => (
            <article key={c.name} onPointerMove={spot} className={`spotlight group relative flex h-full flex-col rounded-[1.75rem] border p-8 md:p-9 ${i === 1 ? "border-sky/40 bg-gradient-to-b from-sky/[0.09] to-ink" : "border-line bg-ink"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-semibold tracking-tight text-white">{c.name}</h3>
                <span className="rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-widest text-sky">{c.tag}</span>
              </div>
              <p className="mt-4 leading-relaxed text-mute">{c.blurb}</p>
              <ul className="mt-8 space-y-3.5 border-t border-line pt-8">
                {c.specs.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-[0.95rem] text-fog/85">
                    <Icon name="check" size={17} className="mt-0.5 shrink-0 text-sky" strokeWidth={2.2} />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <Link
                  href={`/contact/?interest=${encodeURIComponent(product.quoteInterest)}&item=${encodeURIComponent(`${product.short} - ${c.name}`)}#quote`}
                  className="group/l inline-flex items-center gap-2 font-medium text-white"
                >
                  Get a quote
                  <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover/l:translate-x-1.5" />
                </Link>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Why({ product }: { product: ProductLine }) {
  return (
    <section id="why" className="relative scroll-mt-28 bg-ink py-28 md:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div>
          <p className="eyebrow">Why Squinix</p>
          <SplitReveal className="display-2 mt-6 max-w-[12ch]">More than a box on a doorstep.</SplitReveal>
        </div>
        <Reveal stagger={0.1} className="grid gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line sm:grid-cols-2">
          {product.why.map((w, i) => (
            <div key={w.title} className="bg-ink p-8">
              <span className="font-mono text-sm tracking-widest text-sky">0{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{w.title}</h3>
              <p className="mt-2 leading-relaxed text-mute">{w.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function RelatedLines({ current }: { current: ProductLine["slug"] }) {
  const others = products.filter((p) => p.slug !== current);
  return (
    <section className="bg-ink-2 py-24">
      <div className="container-x">
        <p className="eyebrow">Keep exploring</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {others.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}/`} className="group relative block aspect-[16/11] overflow-hidden rounded-[1.5rem] border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/sequences/${p.sequence}/card.webp`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="text-xl font-semibold text-white">{p.short}</p>
                  <p className="mt-1 text-sm text-fog/70">{p.tagline}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/5 text-white backdrop-blur transition-all duration-500 group-hover:bg-white group-hover:text-ink">
                  <Icon name="arrow-up-right" size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
