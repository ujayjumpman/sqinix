const words = ["Gaming PCs", "Business laptops", "Servers", "Networking", "Storage", "Peripherals", "IT consulting", "Custom software", "Installation", "Support"];

/** CSS-only infinite marquee (pauses on hover, static for reduced motion via the global rule). */
export function Marquee() {
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10">
      {words.map((w) => (
        <li key={w} className="flex items-center gap-10 whitespace-nowrap text-[clamp(1.4rem,3vw,2.4rem)] font-bold tracking-tight text-fog/40">
          {w}
          <span className="h-1.5 w-1.5 rounded-full bg-sky/60" />
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-line bg-ink py-7 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-[marquee_46s_linear_infinite] hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
