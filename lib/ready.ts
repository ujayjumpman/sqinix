"use client";

declare global {
  interface Window {
    __sqxReady?: boolean;
  }
}

/** Resolves once the preloader has finished (or immediately if it never runs). */
export function whenReady(timeoutMs = 3500): Promise<void> {
  if (typeof window === "undefined" || window.__sqxReady) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.addEventListener("sqx:ready", done, { once: true });
    window.setTimeout(done, timeoutMs);
  });
}

/** Resolves after the window load event and a spare moment (keeps heavy media off the critical path). */
export function afterLoad(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
      if (w.requestIdleCallback) w.requestIdleCallback(() => resolve(), { timeout: 1500 });
      else setTimeout(resolve, 300);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  });
}

export function markReady() {
  window.__sqxReady = true;
  window.dispatchEvent(new Event("sqx:ready"));
}
