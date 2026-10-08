// The traced vector logo lives in /public/brand (see scripts/trace-logo.mjs).
// Swap those files for the client's original vector artwork when available.

type Props = { className?: string; height?: number; priority?: boolean };

/** Full lock-up: mark + SQUINIX wordmark (aspect 2032:648). */
export function Logo({ className = "", height = 36, priority = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt="Squinix"
      width={Math.round(height * (2032 / 648))}
      height={height}
      className={className}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

/** The ribbon "S" on its own (aspect 336:648). */
export function LogoMark({ className = "", height = 40 }: Omit<Props, "priority">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo-mark.svg" alt="" aria-hidden width={Math.round(height * (336 / 648))} height={height} className={className} decoding="async" />
  );
}
