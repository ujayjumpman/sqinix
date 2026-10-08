"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { afterLoad } from "@/lib/ready";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** true when the visitor asked the OS for reduced motion. SSR renders the full-motion layout. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMedia("(prefers-reduced-motion: reduce)"),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/** true on touch / small screens - used to pick the lighter sequence variant. */
export function useIsPortraitOrSmall(): boolean {
  const q = "(max-width: 767px), (max-aspect-ratio: 1/1)";
  return useSyncExternalStore(
    subscribeMedia(q),
    () => window.matchMedia(q).matches,
    () => false
  );
}

const subscribeNever = () => () => {};

/** false during SSR and the hydration pass, true afterwards (client-only rendering without effects). */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

/** false until the page has loaded and gone idle - use to defer heavy media. */
export function useAfterLoad(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    void afterLoad().then(() => live && setOk(true));
    return () => {
      live = false;
    };
  }, []);
  return ok;
}

/** true when Save-Data or a 2G connection is reported. SSR renders the full experience. */
export function useDataSaver(): boolean {
  return useSyncExternalStore(subscribeNever, prefersLightData, () => false);
}

/** current location.search (empty during SSR) */
export function useSearch(): string {
  return useSyncExternalStore(subscribeNever, () => window.location.search, () => "");
}

export function prefersLightData(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData) || c?.effectiveType === "slow-2g" || c?.effectiveType === "2g";
}
