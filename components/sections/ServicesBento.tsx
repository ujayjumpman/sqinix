"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icon";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { services } from "@/content/services";

/** Light-theme bento of the four consulting services. Cards rise in on scroll, glow follows the cursor. */
export function ServicesBento() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.current!.querySelectorAll(".reveal-init").forEach((n) => n.classList.remove("reveal-init"));
        return;
      }
      gsap.fromTo(
        root.current!.querySelectorAll("[data-card]"),
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: root.current!.querySelector("[data-grid]"), start: "top 82%", once: true },
          onStart: () => root.current!.querySelectorAll("[data-card]").forEach((n) => n.classList.remove("reveal-init")),
        }
      );
      // draw-on lines in the hero card
      gsap.to(root.current!.querySelectorAll("[data-draw]"), {
        strokeDashoffset: 0,
        duration: 2,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 60%", once: true },
      });
    },
    { scope: root }
  );

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const spans = ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

  return (
    <section ref={root} className="relative bg-paper py-28 text-ink md:py-40">
      <div className="container-x">
        <p className="eyebrow !text-brand-deep before:!bg-brand-deep before:!shadow-none">Beyond the box</p>
        <SplitReveal className="display-2 mt-6 max-w-[18ch]">IT consulting that puts the hardware to work.</SplitReveal>
        <p className="lead mt-6 max-w-2xl !text-ink/60">The machines are only half of it. Our consultants help you plan, build and run the technology around them.</p>

        <div data-grid className="mt-16 grid gap-4 lg:grid-cols-12">
          {services.map((s, i) => (
            <article
              key={s.id}
              data-card
              onPointerMove={spot}
              className={`reveal-init spotlight group relative flex min-h-[19rem] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white p-7 shadow-[0_1px_0_rgb(255_255_255)_inset] transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgb(21_102_173/0.45)] md:p-9 ${spans[i]}`}
            >
              {i === 0 && (
                <svg aria-hidden viewBox="0 0 400 260" className="pointer-events-none absolute -right-6 bottom-0 hidden h-[78%] w-auto text-brand lg:block" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {["M10 230 C 90 210, 120 120, 200 130 S 330 40, 395 20", "M10 250 C 100 235, 150 170, 220 175 S 340 110, 395 90", "M10 200 C 80 170, 140 150, 210 90 S 320 30, 395 -10"].map((d, k) => (
                    <path key={k} data-draw d={d} strokeDasharray="520" strokeDashoffset="520" opacity={1 - k * 0.3} />
                  ))}
                  {[[200, 130], [330, 70], [120, 195]].map(([x, y], k) => (
                    <circle key={k} cx={x} cy={y} r="5" fill="currentColor" stroke="none" />
                  ))}
                </svg>
              )}
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-sky transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon name={s.icon} size={22} />
                </span>
                <span className="font-mono text-sm tracking-widest text-ink/30">{s.n}</span>
              </div>
              <div className="relative mt-10 max-w-md">
                <h3 className="text-[1.65rem] font-semibold leading-tight tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/60">{s.lead}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {s.bullets.slice(0, 3).map((b) => (
                    <li key={b} className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs text-ink/70">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/services/" className="group inline-flex items-center gap-2 text-[0.98rem] font-medium text-brand-deep">
            All services
            <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
