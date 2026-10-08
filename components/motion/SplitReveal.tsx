"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { whenReady } from "@/lib/ready";

type Props = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** "load" plays immediately; "scroll" waits until the element is in view */
  trigger?: "load" | "scroll";
  delay?: number;
  stagger?: number;
  id?: string;
};

/** Headline reveal: each line slides up from behind a mask. Re-splits on resize. */
export function SplitReveal({ as: Tag = "h2", className = "", children, trigger = "scroll", delay = 0, stagger = 0.09, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.style.visibility = "visible";
        return;
      }
      // load-triggered headlines ship visible in the HTML (first paint / LCP) and are tucked away here, under the intro
      el.style.visibility = "hidden";
      let cancelled = false;
      let split: SplitText | undefined;
      let ran = false;
      void (trigger === "load" ? whenReady() : Promise.resolve()).then(() =>
        document.fonts.ready.then(() => {
          if (cancelled || !el.isConnected) return;
          split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit(self) {
              el.style.visibility = "visible";
              const tween = gsap.from(self.lines, {
                yPercent: ran ? 0 : 115,
                opacity: ran ? 1 : 0,
                duration: 1.1,
                stagger,
                delay: ran ? 0 : delay,
                ease: "expo.out",
                scrollTrigger: trigger === "scroll" && !ran ? { trigger: el, start: "top 88%", once: true } : undefined,
              });
              ran = true;
              return tween;
            },
          });
        })
      );
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} id={id} className={className} data-split={trigger} style={trigger === "scroll" ? { visibility: "hidden" } : undefined}>
      {children}
    </Tag>
  );
}
