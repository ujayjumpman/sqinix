"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Logo } from "@/components/brand/Logo";
import { Icon, SocialIcon } from "@/components/ui/Icon";
import { site } from "@/content/site";
import { products } from "@/content/products";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        word.current,
        { yPercent: 38, opacity: 0.2 },
        { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: 0.5 } }
      );
    },
    { scope: root }
  );

  const socials = (Object.entries(site.social) as [keyof typeof site.social, string][]).filter(([, v]) => v);

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-line bg-ink">
      <div className="container-x grid gap-12 border-t border-line py-14 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo height={34} />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">{site.description}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(([k, url]) => (
                <li key={k}>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={k} className="grid h-10 w-10 place-items-center rounded-full border border-line text-fog/70 transition-colors hover:border-sky hover:text-white">
                    <SocialIcon name={k} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Products">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-mute">Products</h2>
          <ul className="mt-5 space-y-3 text-[0.95rem]">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}/`} className="text-fog/80 transition-colors hover:text-white">
                  {p.short}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-mute">Company</h2>
          <ul className="mt-5 space-y-3 text-[0.95rem]">
            {[
              ["Services", "/services/"],
              ["About", "/about/"],
              ["Contact", "/contact/"],
              ["Get a quote", "/contact/#quote"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="text-fog/80 transition-colors hover:text-white">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-mute">Contact</h2>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-fog/80">
            <li className="flex gap-3">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-sky" />
              <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {site.address.line}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-sky" />
              <a href={`tel:${site.phone.tel}`} className="hover:text-white">
                {site.phone.display}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="whatsapp" size={18} className="mt-0.5 shrink-0 text-sky" />
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {site.whatsapp.display} (WhatsApp)
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-sky" />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
          </ul>
        </address>
      </div>

      {/* giant wordmark */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <div ref={word} className="whitespace-nowrap bg-gradient-to-b from-white/[0.14] to-transparent bg-clip-text text-center text-[clamp(5rem,23vw,26rem)] font-semibold leading-[0.82] tracking-[-0.06em] text-transparent">
          SQUINIX
        </div>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-line py-6 text-xs text-mute md:flex-row md:items-center md:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        {(site.legal.cin || site.legal.registeredOffice) && (
          <p>
            {site.legal.cin && <>CIN: {site.legal.cin}</>}
            {site.legal.cin && site.legal.registeredOffice && " · "}
            {site.legal.registeredOffice}
          </p>
        )}
      </div>
    </footer>
  );
}
