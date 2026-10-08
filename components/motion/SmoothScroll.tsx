"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    window.__lenis = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // in-page anchors glide instead of jumping
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // every route starts at the top (or at its #hash target), and triggers re-measure once the new page is in
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) window.__lenis?.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      const el = hash ? document.querySelector(hash) : null;
      if (el) {
        if (window.__lenis) window.__lenis.scrollTo(el as HTMLElement, { immediate: true, offset: -72, force: true });
        else el.scrollIntoView();
      }
    }, 260);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
