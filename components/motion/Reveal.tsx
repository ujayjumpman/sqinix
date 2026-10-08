"use client";

import { Children, isValidElement, useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  y?: number;
  /** animate direct children one after another instead of the wrapper */
  stagger?: number;
  start?: string;
};

/** Fade + rise on scroll. Wrapper (or its children when `stagger` is set) starts hidden via .reveal-init. */
export function Reveal({ as: Tag = "div", className = "", children, delay = 0, y = 28, stagger, start = "top 90%" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = stagger ? Array.from(el.children) : [el];
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        targets.forEach((t) => t.classList.remove("reveal-init"));
        return;
      }
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          stagger: stagger ?? 0,
          ease: "expo.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start, once: true },
          onStart: () => targets.forEach((t) => t.classList.remove("reveal-init")),
        }
      );
    },
    { scope: ref }
  );

  // children get the hidden state when staggering; the wrapper itself otherwise
  if (stagger) {
    return (
      <Tag ref={ref} className={className}>
        {Children.toArray(children).map((c, i) =>
          isValidElement(c) ? (
            <div key={i} className="reveal-init">
              {c}
            </div>
          ) : (
            c
          )
        )}
      </Tag>
    );
  }
  return (
    <Tag ref={ref} className={`reveal-init ${className}`}>
      {children}
    </Tag>
  );
}
