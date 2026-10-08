"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { nav, site } from "@/content/site";
import { products } from "@/content/products";

export function Nav() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);
  // open state is remembered together with the path it was opened on, so navigating closes it
  const [megaPath, setMegaPath] = useState<string | null>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mega = megaPath === pathname;
  const menu = menuPath === pathname;
  const setMega = (v: boolean) => setMegaPath(v ? pathname : null);
  const setMenu = (fn: boolean | ((v: boolean) => boolean)) => setMenuPath((typeof fn === "function" ? fn(menu) : fn) ? pathname : null);
  const closeTimer = useRef<number>(0);
  const wasOpen = useRef(false);

  // hide on scroll down, reveal on scroll up; frosted once off the top
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        setSolid(y > 24);
        const hide = self.direction === 1 && y > 220;
        document.documentElement.style.setProperty("--nav-h", hide ? "0px" : "4.5rem");
        gsap.to(header.current, { yPercent: hide ? -110 : 0, duration: 0.45, ease: "power3.out", overwrite: true });
        if (hide) setMegaPath(null);
      },
    });
    return () => st.kill();
  }, []);

  // full-screen mobile menu
  useGSAP(
    () => {
      const el = overlay.current;
      if (!el) return;
      if (menu) {
        window.__lenis?.stop();
        document.documentElement.style.overflow = "hidden";
        gsap.set(el, { display: "flex" });
        gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.out" });
        gsap.fromTo(el.querySelectorAll("[data-item]"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.07, delay: 0.15, ease: "expo.out" });
        wasOpen.current = true;
      } else if (wasOpen.current) {
        wasOpen.current = false;
        window.__lenis?.start();
        document.documentElement.style.overflow = "";
        gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "expo.inOut", onComplete: () => void gsap.set(el, { display: "none" }) });
      }
    },
    { dependencies: [menu], scope: overlay }
  );

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    closeTimer.current = window.setTimeout(() => setMega(false), 120);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith("/" + href.split("/")[1]));

  return (
    <>
      <header
        ref={header}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500 ${
          solid || mega ? "border-b border-line bg-ink/70 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent"
        }`}
        onMouseLeave={closeMega}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" aria-label="Squinix home" className="relative z-10 shrink-0">
            <Logo height={34} priority />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <div key={item.href} className="relative" onMouseEnter={"mega" in item && item.mega ? openMega : closeMega}>
                <Link
                  href={item.href}
                  aria-haspopup={"mega" in item && item.mega ? "true" : undefined}
                  aria-expanded={"mega" in item && item.mega ? mega : undefined}
                  onFocus={"mega" in item && item.mega ? openMega : undefined}
                  className={`group relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-[0.92rem] tracking-tight transition-colors ${
                    isActive(item.href) ? "text-white" : "text-fog/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  {"mega" in item && item.mega && <Icon name="down" size={14} className={`transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />}
                  <span className="absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-sky transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href={`tel:${site.phone.tel}`} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-fog/70 transition-colors hover:text-white">
              <Icon name="phone" size={16} />
              {site.phone.display}
            </a>
            <Button href="/contact/#quote" className="!px-5 !py-2.5 text-sm">
              Get a quote
            </Button>
          </div>

          <button
            type="button"
            className="relative z-[60] grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.04] text-fog backdrop-blur lg:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            <Icon name={menu ? "close" : "menu"} size={20} />
          </button>
        </div>

        {/* mega menu */}
        <div
          onMouseEnter={openMega}
          className={`absolute inset-x-0 top-full hidden overflow-hidden border-b border-line bg-ink/95 backdrop-blur-2xl transition-[clip-path,opacity] duration-500 lg:block ${
            mega ? "pointer-events-auto opacity-100 [clip-path:inset(0_0_0%_0)]" : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"
          }`}
        >
          <div className="container-x grid grid-cols-4 gap-5 py-8">
            {products.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}/`} className="group block" tabIndex={mega ? 0 : -1}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-ink-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/media/sequences/${p.sequence}/card.webp`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                </div>
                <p className="mt-3 flex items-center justify-between text-[0.95rem] font-medium text-white">
                  {p.short}
                  <Icon name="arrow-up-right" size={16} className="text-sky opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </p>
                <p className="mt-1 text-sm text-mute">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* mobile full-screen menu */}
      <div ref={overlay} role="dialog" aria-label="Menu" aria-modal="true" className="fixed inset-0 z-40 hidden flex-col justify-between bg-ink px-6 pb-10 pt-28 lg:hidden" style={{ display: "none" }} data-lenis-prevent>
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {[...nav.filter((n) => !("mega" in n && n.mega)), ...products.map((p) => ({ label: p.name, href: `/products/${p.slug}/`, sub: true }))]
            .map((item, i) => (
              <div key={item.href + i} className="overflow-hidden">
                <Link
                  data-item
                  href={item.href}
                  className={`block py-1.5 tracking-tight ${"sub" in item ? "text-xl text-fog/60" : "text-4xl font-semibold text-white"}`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
        </nav>
        <div data-item className="space-y-4">
          <Button href="/contact/#quote" className="w-full">
            Get a quote
          </Button>
          <div className="flex items-center justify-between text-sm text-mute">
            <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
