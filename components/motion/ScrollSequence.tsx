"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useDataSaver, useIsPortraitOrSmall, useReducedMotion } from "@/lib/hooks";
import { afterLoad } from "@/lib/ready";

export type SequenceBeat = {
  /** scroll progress window (0..1) in which this beat is visible */
  from: number;
  to: number;
  align?: "left" | "center" | "right";
  /** vertical placement of the text block (default: bottom, or top for "hero") */
  valign?: "top" | "center" | "bottom";
  eyebrow?: string;
  title: string;
  body?: string;
  /** "hero" renders the title as a display-size headline */
  size?: "hero" | "default";
  cta?: ReactNode;
};

type Variant = { count: number; width: number; height: number; ext: string; pad: number };
type Manifest = { name: string; desktop?: Variant; mobile?: Variant };

type Props = {
  /** folder name under /media/sequences */
  name: string;
  beats: SequenceBeat[];
  /** how many viewport heights the scrub lasts */
  scrollVh?: number;
  className?: string;
  label?: string;
  /** slot for anything that should sit over the stage permanently (e.g. a scroll cue) */
  children?: ReactNode;
};

const BG = "#05070b";
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Apple-style scroll-scrubbed product film.
 *
 * A tall section holds a sticky 100svh stage. Scroll progress maps to a frame
 * index and the frame is painted on a <canvas>. Frames are fetched as small
 * WebP blobs (cheap to keep) and decoded on demand into a bounded LRU of
 * ImageBitmaps, so a 150-frame film never holds hundreds of MB of pixels.
 * Overlay "beats" fade in and out at fixed progress windows.
 */
export function ScrollSequence({ name, beats, scrollVh = 520, className = "", label, children }: Props) {
  const reduced = useReducedMotion();
  const small = useIsPortraitOrSmall();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const saver = useDataSaver();
  const staticMode = reduced || saver;
  const beatsRef = useRef(beats);
  useEffect(() => {
    beatsRef.current = beats; // latest beats without re-running the scrub effect
  });

  useEffect(() => {
    if (staticMode) return;
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let cancelled = false;
    let manifest: Variant | null = null;
    let variantKey: "desktop" | "mobile" = small ? "mobile" : "desktop";
    const blobs: (Blob | undefined)[] = [];
    const bitmaps = new Map<number, ImageBitmap | HTMLImageElement>();
    const pending = new Set<number>();
    let loadedCount = 0;
    let target = 0; // 0..1 scroll progress
    let current = 0; // smoothed progress
    let shown = -1; // frame index painted
    let active = false;
    let raf = 0;
    let started = false;
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let lastDir = 1;
    let lastTarget = 0;

    const CAP = small ? 28 : 44;

    const sizeCanvas = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        shown = -1; // force repaint
      }
    };

    const nearest = (i: number) => {
      if (bitmaps.has(i)) return i;
      const n = manifest!.count;
      for (let d = 1; d < n; d++) {
        if (bitmaps.has(i - d)) return i - d;
        if (bitmaps.has(i + d)) return i + d;
      }
      return -1;
    };

    const paint = (i: number) => {
      const k = nearest(i);
      if (k < 0) return;
      const src = bitmaps.get(k)!;
      const sw = "naturalWidth" in src ? src.naturalWidth : src.width;
      const sh = "naturalHeight" in src ? src.naturalHeight : src.height;
      const ir = sw / sh;
      const cr = cw / ch;
      const dw = cr > ir ? cw : ch * ir;
      const dh = cr > ir ? cw / ir : ch;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      shown = i;
      if (canvas.style.opacity !== "1") canvas.style.opacity = "1";
    };

    const trim = (around: number) => {
      if (bitmaps.size <= CAP) return;
      const keys = [...bitmaps.keys()].sort((a, b) => Math.abs(b - around) - Math.abs(a - around));
      while (bitmaps.size > CAP) {
        const k = keys.shift()!;
        const b = bitmaps.get(k);
        if (b && "close" in b) b.close();
        bitmaps.delete(k);
      }
    };

    const ensureBitmap = async (i: number, around: number) => {
      const blob = blobs[i];
      if (!blob || bitmaps.has(i) || pending.has(i)) return;
      pending.add(i);
      try {
        let bmp: ImageBitmap | HTMLImageElement;
        if ("createImageBitmap" in window) {
          bmp = await createImageBitmap(blob);
        } else {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await img.decode();
          bmp = img;
        }
        if (cancelled) {
          if ("close" in bmp) bmp.close();
          return;
        }
        bitmaps.set(i, bmp);
        trim(around);
        shown = -1; // a better frame may be available now
        if (!raf && active) raf = requestAnimationFrame(tick);
      } catch {
        /* ignore a single bad frame */
      } finally {
        pending.delete(i);
      }
    };

    const updateBeats = (p: number) => {
      const beats = beatsRef.current;
      beats.forEach((b, idx) => {
        const el = beatRefs.current[idx];
        if (!el) return;
        const w = Math.min(0.045, (b.to - b.from) / 4);
        const first = idx === 0;
        const last = idx === beats.length - 1;
        const vin = first ? 1 : smooth(b.from, b.from + w, p);
        const vout = last ? 1 : 1 - smooth(b.to - w, b.to, p);
        const v = Math.min(vin, vout) * (p >= b.from - 0.001 && p <= b.to + 0.001 ? 1 : 0);
        el.style.opacity = String(v);
        el.style.transform = `translate3d(0, ${(1 - v) * 26 * (vin < vout ? 1 : -1)}px, 0)`;
        el.style.filter = v < 0.995 ? `blur(${(1 - v) * 10}px)` : "none";
        el.style.visibility = v < 0.01 ? "hidden" : "visible";
      });
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
    };

    const tick = () => {
      raf = 0;
      if (!manifest) return;
      current += (target - current) * 0.22;
      if (Math.abs(target - current) < 0.0004) current = target;
      const n = manifest.count;
      const idx = Math.min(n - 1, Math.max(0, Math.round(current * (n - 1))));
      if (target !== lastTarget) {
        lastDir = target > lastTarget ? 1 : -1;
        lastTarget = target;
      }
      // keep a decoded window around the playhead, biased in the scroll direction
      for (let k = -5; k <= 14; k++) void ensureBitmap(Math.min(n - 1, Math.max(0, idx + k * lastDir)), idx);
      if (idx !== shown) paint(idx);
      updateBeats(current);
      section.dataset.frame = String(shown);
      section.dataset.progress = current.toFixed(3);
      if (active && (current !== target || shown !== idx)) raf = requestAnimationFrame(tick);
    };

    const fetchAll = async () => {
      const n = manifest!.count;
      const order: number[] = [0];
      for (let i = 8; i < n; i += 8) order.push(i);
      for (let i = 1; i < n; i++) if (i % 8 !== 0) order.push(i);
      order.push(n - 1);
      const uniq = [...new Set(order)];
      const base = `/media/sequences/${name}/${variantKey}`;
      let cursor = 0;
      const worker = async () => {
        while (!cancelled && cursor < uniq.length) {
          const i = uniq[cursor++];
          try {
            const res = await fetch(`${base}/${String(i + 1).padStart(manifest!.pad, "0")}.${manifest!.ext}`, { priority: i < 2 ? "auto" : "low" } as RequestInit);
            if (!res.ok) continue;
            blobs[i] = await res.blob();
            loadedCount++;
            section.dataset.loaded = String(loadedCount);
            if (loaderRef.current) loaderRef.current.style.opacity = loadedCount > 12 ? "0" : "1";
            if (i === 0 || i === 8) void ensureBitmap(i, 0).then(() => active && !raf && (raf = requestAnimationFrame(tick)));
          } catch {
            /* network hiccup: skip frame, nearest-frame fallback covers it */
          }
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    };

    const start = async () => {
      if (started) return;
      started = true;
      try {
        await afterLoad(); // never compete with the first paint
        if (cancelled) return;
        const res = await fetch(`/media/sequences/${name}/manifest.json`);
        const m: Manifest = await res.json();
        if (cancelled) return;
        if (variantKey === "mobile" && !m.mobile) variantKey = "desktop";
        manifest = (m[variantKey] ?? m.desktop)!;
        section.dataset.frames = String(manifest.count);
        sizeCanvas();
        await fetchAll();
      } catch (e) {
        console.warn(`[ScrollSequence] could not load "${name}"`, e);
      }
    };

    const loadTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom+=160%",
      end: "bottom top",
      onEnter: start,
      onEnterBack: start,
    });
    const runTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        active = self.isActive;
        if (active && !raf) raf = requestAnimationFrame(tick);
      },
    });
    const progressTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
        if (!raf && active) raf = requestAnimationFrame(tick);
      },
      onRefresh: (self) => {
        target = self.progress;
        current = self.progress;
      },
    });
    updateBeats(0);

    const ro = new ResizeObserver(() => {
      sizeCanvas();
      if (!raf && active) raf = requestAnimationFrame(tick);
    });
    ro.observe(canvas.parentElement!);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      loadTrigger.kill();
      runTrigger.kill();
      progressTrigger.kill();
      ro.disconnect();
      bitmaps.forEach((b) => "close" in b && b.close());
      bitmaps.clear();
    };
  }, [name, small, staticMode]);

  const poster = (
    <picture>
      <source media="(max-width: 767px), (max-aspect-ratio: 1/1)" srcSet={`/media/sequences/${name}/poster-mobile.webp`} />
      <img
        src={`/media/sequences/${name}/poster-desktop.webp`}
        alt=""
        width={1440}
        height={810}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );

  if (staticMode) {
    return (
      <section aria-label={label} className={`relative bg-ink ${className}`}>
        <div className="relative h-[70svh] w-full overflow-hidden">{poster}</div>
        <div className="container-x grid gap-px py-14 md:grid-cols-2">
          {beats.map((b, i) => (
            <div key={i} className="rounded-3xl border border-line bg-ink-2 p-8">
              {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
              {b.size === "hero" ? <h1 className="display-3 mt-4">{b.title}</h1> : <h2 className="display-3 mt-4">{b.title}</h2>}
              {b.body && <p className="lead mt-4">{b.body}</p>}
              {b.cta && <div className="mt-6">{b.cta}</div>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      data-sequence={name}
      className={`relative bg-ink ${className}`}
      style={{ height: `${scrollVh}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {poster}
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" />
        {/* legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,rgb(5_7_11/0.65),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        {/* beats */}
        <div className="container-x pointer-events-none absolute inset-0">
          {beats.map((b, i) => {
            const align = b.align ?? "left";
            const valign = b.valign ?? (b.size === "hero" ? "top" : "bottom");
            return (
              <div
                key={i}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                className={`absolute will-change-[opacity,transform,filter] ${
                  valign === "top" ? "top-[16svh]" : valign === "center" ? "top-1/2 -translate-y-1/2" : "bottom-[9svh]"
                } ${
                  align === "left" ? "left-0 max-w-[34rem]" : align === "right" ? "right-0 max-w-[34rem] text-right" : "left-1/2 w-full -translate-x-1/2 text-center"
                } ${b.size === "hero" ? "!max-w-[68rem]" : align === "center" ? "!max-w-[42rem]" : ""}`}
                // the opening beat ships visible in the HTML (fast LCP); later beats wait for scroll
                style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
              >
                {b.eyebrow && <p className={`eyebrow ${align === "right" ? "flex-row-reverse" : ""} ${align === "center" ? "justify-center" : ""}`}>{b.eyebrow}</p>}
                {b.size === "hero" ? (
                  <h1 className="display-1 mt-5 [text-shadow:0_2px_40px_rgb(5_7_11/0.6)]">{b.title}</h1>
                ) : (
                  <h2 className="display-3 mt-4 [text-shadow:0_2px_30px_rgb(5_7_11/0.7)]">{b.title}</h2>
                )}
                {b.body && <p className="lead mt-4 text-fog/80 [text-shadow:0_1px_20px_rgb(5_7_11/0.8)]">{b.body}</p>}
                {b.cta && <div className="pointer-events-auto mt-7">{b.cta}</div>}
              </div>
            );
          })}
        </div>

        {/* progress rail */}
        <div className="pointer-events-none absolute right-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-white/15 md:block" aria-hidden>
          <div ref={barRef} className="h-full w-px origin-top bg-sky" style={{ transform: "scaleY(0)" }} />
        </div>

        {/* frame loader hairline */}
        <div ref={loaderRef} className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-mute transition-opacity" aria-hidden>
          loading film
        </div>
        {children}
      </div>
    </section>
  );
}
