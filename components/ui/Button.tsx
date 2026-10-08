"use client";

import Link from "next/link";
import { useRef, type ComponentProps, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { Icon } from "./Icon";

type Variant = "primary" | "ghost" | "light" | "dark";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-[0.95rem] font-medium tracking-tight transition-[background,color,border-color,box-shadow] duration-300 will-change-transform";

const styles: Record<Variant, string> = {
  primary: "bg-fog text-ink hover:bg-white hover:shadow-[0_10px_50px_-8px_rgb(82_184_236/0.65)]",
  ghost: "border border-white/20 bg-white/[0.04] text-fog backdrop-blur hover:border-white/40 hover:bg-white/10",
  light: "bg-ink text-fog hover:bg-ink-3",
  dark: "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5",
};

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  arrow?: boolean;
  external?: boolean;
  className?: string;
  magnetic?: boolean;
} & Omit<ComponentProps<"a">, "href" | "className">;

/** Pill button. On fine pointers it leans toward the cursor (magnetic). */
export function Button({ href, variant = "primary", children, arrow = true, external, className = "", magnetic = true, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => ref.current && gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.45)" });

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {arrow && <Icon name="arrow" size={17} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );
  const cls = `${base} ${styles[variant]} ${className}`;
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a ref={ref} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link ref={ref} href={href} className={cls} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {inner}
    </Link>
  );
}
