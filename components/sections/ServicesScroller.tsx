"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { services } from "@/content/services";

/* Four abstract illustrations (stroke art in brand colours). `on` plays the entrance. */
function Art({ id, on }: { id: string; on: boolean }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const draw = (len: number, delay = 0) => ({
    strokeDasharray: len,
    strokeDashoffset: on ? 0 : len,
    transition: `stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });
  switch (id) {
    case "strategy":
      return (
        <svg viewBox="0 0 400 400" className="h-full w-full text-sky" {...common}>
          <circle cx="200" cy="200" r="150" opacity=".15" />
          <circle cx="200" cy="200" r="100" opacity=".2" />
          <circle cx="200" cy="200" r="50" opacity=".3" />
          <path d="M40 330 C 110 330, 130 250, 190 240 S 290 160, 360 70" style={draw(520)} strokeWidth="2.4" />
          {[[40, 330], [190, 240], [290, 160], [360, 70]].map(([x, y], i) => (
            <g key={i} style={{ opacity: on ? 1 : 0, transition: `opacity .6s ${0.5 + i * 0.3}s` }}>
              <circle cx={x} cy={y} r="9" fill="currentColor" stroke="none" />
              <circle cx={x} cy={y} r="20" opacity=".35" className="origin-center animate-[pulse-ring_3s_ease-out_infinite]" style={{ transformBox: "fill-box", animationDelay: `${i * 0.5}s` }} />
            </g>
          ))}
          <path d="M360 70 l-18 4 m18 -4 l-4 18" style={draw(40, 1.4)} />
        </svg>
      );
    case "apps":
      return (
        <svg viewBox="0 0 400 400" className="h-full w-full text-sky" {...common}>
          <rect x="50" y="70" width="300" height="220" rx="18" style={draw(1000)} />
          <path d="M50 108 H350" opacity=".6" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={74 + i * 20} cy="89" r="4" fill="currentColor" stroke="none" opacity={0.8 - i * 0.2} />
          ))}
          {[[80, 140, 110], [96, 164, 150], [96, 188, 90], [80, 212, 130], [96, 236, 170], [80, 260, 70]].map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height="9" rx="4.5" fill="currentColor" stroke="none" opacity={i % 2 ? 0.5 : 0.9} style={{ transformOrigin: `${x}px ${y}px`, transform: on ? "scaleX(1)" : "scaleX(0)", transition: `transform .9s cubic-bezier(.22,1,.36,1) ${0.3 + i * 0.12}s` }} />
          ))}
          <g className="animate-[float-y_5s_ease-in-out_infinite]">
            <rect x="248" y="150" width="130" height="86" rx="14" fill="#05070b" />
            <path d="M268 178h70M268 198h44" />
            <circle cx="350" cy="196" r="12" />
          </g>
        </svg>
      );
    case "transformation":
      return (
        <svg viewBox="0 0 400 400" className="h-full w-full text-sky" {...common}>
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={40 + ((i * 53) % 110)} cy={90 + ((i * 97) % 220)} r="5" fill="currentColor" stroke="none" opacity={on ? 0.35 : 0.9} style={{ transition: `opacity 1s ${i * 0.05}s` }} />
          ))}
          <path d="M165 110 L240 190 L165 290 M240 190 H300" style={draw(380, 0.2)} strokeWidth="2.2" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={290 + (i % 3) * 26} y={120 + Math.floor(i / 3) * 40} width="18" height="26" rx="5" fill="currentColor" stroke="none" opacity={on ? 0.9 - (i % 3) * 0.2 : 0} style={{ transition: `opacity .6s ${0.8 + i * 0.07}s` }} />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 400 400" className="h-full w-full text-sky" {...common}>
          <path d="M40 150 H150 L190 195 L150 250 H40" style={draw(520)} strokeWidth="2" />
          <path d="M360 150 H250 L210 195 L250 250 H360" style={draw(520, 0.3)} strokeWidth="2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} r="5" fill="currentColor" stroke="none" className="animate-[none]" cx={60 + i * 18} cy={170 + (i % 3) * 22} opacity={0.8 - i * 0.1} style={{ transform: on ? `translateX(${i * 6}px)` : "none", transition: "transform 1.4s" }} />
          ))}
          <path d="M60 310 H340" opacity=".25" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={70 + i * 54} y={310 - (i + 1) * 12} width="30" height={(i + 1) * 12} rx="6" fill="currentColor" stroke="none" opacity=".35" style={{ transformOrigin: `${70 + i * 54}px 310px`, transform: on ? "scaleY(1)" : "scaleY(0)", transition: `transform .9s cubic-bezier(.22,1,.36,1) ${0.4 + i * 0.12}s` }} />
          ))}
        </svg>
      );
  }
}

/** Services page: a sticky illustration on the left swaps as each service scrolls past on the right. */
export function ServicesScroller() {
  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const triggers = blocks.current.map((el, i) => (el ? ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(i) }) : null));
    return () => triggers.forEach((t) => t?.kill());
  }, []);

  return (
    <section className="relative bg-ink">
      <div className="container-x grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        {/* sticky art (desktop) */}
        <div className="relative hidden lg:block">
          <div className="sticky top-[18svh] aspect-square w-full max-w-[34rem]">
            <div className="absolute inset-0 rounded-[2.5rem] border border-line bg-gradient-to-b from-white/[0.05] to-transparent" />
            <div className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-[100px]" />
            {services.map((s, i) => (
              <div key={s.id} className={`absolute inset-0 p-10 transition-all duration-700 ease-[var(--ease-expo)] ${active === i ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-[0.94] opacity-0 blur-md"}`}>
                <Art id={s.id} on={active === i} />
              </div>
            ))}
            <p className="absolute bottom-6 left-8 font-mono text-xs uppercase tracking-[0.25em] text-mute">
              {services[active].n} / 0{services.length}
            </p>
          </div>
        </div>

        <div>
          {services.map((s, i) => (
            <article
              key={s.id}
              id={s.id}
              ref={(el) => {
                blocks.current[i] = el;
              }}
              className="flex min-h-[78svh] scroll-mt-28 flex-col justify-center border-t border-line py-20 first:border-t-0 lg:py-0"
            >
              <div className="mb-10 aspect-[5/3] w-full rounded-[1.75rem] border border-line bg-white/[0.03] p-6 lg:hidden">
                <Art id={s.id} on />
              </div>
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/10 text-sky">
                  <Icon name={s.icon} size={22} />
                </span>
                <span className="font-mono text-sm tracking-widest text-mute">{s.n}</span>
              </div>
              <h2 className="display-3 mt-6">{s.title}</h2>
              <p className="mt-4 text-xl font-medium tracking-tight text-sky">{s.lead}</p>
              <p className="lead mt-5 max-w-xl">{s.body}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.03] px-4 py-3.5 text-[0.95rem] text-fog/85">
                    <Icon name="check" size={17} className="mt-0.5 shrink-0 text-sky" strokeWidth={2.2} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button href={`/contact/?interest=${encodeURIComponent(s.id === "apps" ? "Custom software" : "IT consulting")}&item=${encodeURIComponent(s.title)}#quote`} variant="ghost">
                  Discuss this
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
