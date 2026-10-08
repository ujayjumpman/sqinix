"use client";

import { useEffect, useRef, useState } from "react";
import { useAfterLoad, useDataSaver, useIsPortraitOrSmall, useReducedMotion } from "@/lib/hooks";
import { Icon } from "@/components/ui/Icon";

type Props = {
  /** file stem under /media/video, e.g. "hero" -> hero.mp4 / hero.webm / hero-m.mp4 ... */
  name: string;
  className?: string;
  /** show the accessible pause/play control (WCAG 2.2.2) */
  control?: boolean;
  objectPosition?: string;
};

/**
 * Muted, looping, inline autoplay background video.
 * - the poster <img> is always rendered (fast LCP, no-JS, reduced-motion)
 * - the <video> is added after mount, in the lighter encode on phones
 * - pauses itself when scrolled off-screen
 */
export function LoopVideo({ name, className = "", control = true, objectPosition = "center" }: Props) {
  const small = useIsPortraitOrSmall();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const saver = useDataSaver();
  const loaded = useAfterLoad();
  const enabled = loaded && !reduced && !saver;

  useEffect(() => {
    const v = ref.current;
    const w = wrap.current;
    if (!v || !w || !enabled) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (paused) return;
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(w);
    return () => io.disconnect();
  }, [enabled, paused, small]);

  const suffix = small ? "-m" : "";
  return (
    <div ref={wrap} className={`absolute inset-0 overflow-hidden ${className}`}>
      <picture>
        <source media="(max-width: 767px), (max-aspect-ratio: 1/1)" srcSet={`/media/video/${name}-m-poster.webp`} />
        <img
          src={`/media/video/${name}-poster.webp`}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
      {enabled && (
        <video
          key={suffix}
          ref={ref}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0, objectPosition }}
        >
          <source src={`/media/video/${name}${suffix}.mp4`} type="video/mp4" />
          <source src={`/media/video/${name}${suffix}.webm`} type="video/webm" />
        </video>
      )}
      {enabled && control && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            if (v.paused) {
              void v.play();
              setPaused(false);
            } else {
              v.pause();
              setPaused(true);
            }
          }}
          aria-label={paused ? "Play background video" : "Pause background video"}
          className="glass absolute bottom-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-full text-fog transition-colors hover:bg-white/15"
        >
          <Icon name={paused ? "play" : "pause"} size={16} />
        </button>
      )}
    </div>
  );
}
