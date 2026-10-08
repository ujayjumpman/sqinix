"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LogoMark } from "@/components/brand/Logo";

let firstLoad = true;

/**
 * Re-mounts on every navigation: a brand curtain wipes upward while the new page fades in.
 * Only opacity is animated on the content wrapper (a lingering transform would break pinned sections).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const c = curtain.current!;
    if (firstLoad || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      firstLoad = false;
      c.style.display = "none";
      return;
    }
    gsap.set(c, { display: "grid", yPercent: 0 });
    gsap.set(content.current, { opacity: 0 });
    const tl = gsap.timeline();
    tl.to(c.firstElementChild, { opacity: 0, scale: 0.9, duration: 0.35, ease: "power2.in" }, 0.15)
      .to(c, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 0.25)
      .to(content.current, { opacity: 1, duration: 0.7, ease: "power2.out", clearProps: "opacity" }, 0.45)
      .set(c, { display: "none" });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <div ref={content}>{children}</div>
      <div ref={curtain} aria-hidden className="fixed inset-0 z-[90] hidden place-items-center bg-ink-2">
        <LogoMark height={64} />
      </div>
    </>
  );
}
