"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Apple-style statement: words brighten one by one as you scroll through. */
export function WordHighlight({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const spans = el.querySelectorAll<HTMLElement>("[data-w]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(spans, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        spans,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.4 },
        }
      );
    },
    { scope: ref }
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} data-w className="inline-block opacity-[0.16]">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
