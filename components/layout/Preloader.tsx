"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { markReady } from "@/lib/ready";
import { LogoMark } from "@/components/brand/Logo";

/**
 * Brand intro: the ribbon mark builds in while a counter runs, then the panel lifts away.
 * Skipped on repeat visits (sessionStorage) and for reduced motion - an inline script in
 * <head> adds .skip-preload before first paint so nothing flashes.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const markWrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const skip = document.documentElement.classList.contains("skip-preload");
      if (skip) {
        el.style.display = "none";
        markReady();
        return;
      }
      try {
        sessionStorage.setItem("sqx-v", "1");
      } catch {
        /* private mode */
      }
      document.documentElement.style.overflow = "hidden";
      const state = { n: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = "none";
          document.documentElement.style.overflow = "";
          markReady();
        },
      });
      tl.fromTo(markWrap.current, { scale: 0.8, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out" }, 0)
        .to(state, { n: 100, duration: 0.8, ease: "power2.inOut", onUpdate: () => count.current && (count.current.textContent = String(Math.round(state.n)).padStart(3, "0")) }, 0.1)
        .to(bar.current, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 0.1)
        .to(markWrap.current, { scale: 1.08, duration: 0.4, ease: "power2.in" }, 0.85)
        .to(el, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 1.05)
        .add(() => markReady(), 1.3);
    },
    { scope: root }
  );

  return (
    <div ref={root} aria-hidden className="preloader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink">
      <div ref={markWrap} className="will-change-transform" style={{ opacity: 0 }}>
        <LogoMark height={92} />
      </div>
      <div className="mt-10 w-48">
        <div className="h-px w-full bg-white/10">
          <div ref={bar} className="h-px origin-left scale-x-0 bg-gradient-to-r from-sky to-violet" />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.3em] text-mute">
          <span>Squinix</span>
          <span ref={count}>000</span>
        </div>
      </div>
    </div>
  );
}
