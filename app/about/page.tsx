import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { WordHighlight } from "@/components/motion/WordHighlight";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: "Squinix Solutions Private Limited is an IT hardware, gaming hardware and consulting company based in Noida West, India.",
  alternates: { canonical: "/about/" },
};

// TODO(client): founder story, year founded, team and real numbers are not published anywhere yet,
// so none are invented here. Add them to this page when available (see CONTENT-CHECKLIST.md).
const principles = [
  { icon: "check", title: "Honest advice", body: "We recommend what fits the job and the budget, even when that's the cheaper option." },
  { icon: "wrench", title: "Built properly", body: "Clean builds, careful installs and testing, because the details are what you live with." },
  { icon: "phone", title: "Support that answers", body: "A real team on the other end of the phone when something needs fixing." },
  { icon: "pin", title: "Local and accountable", body: "Based in Noida West, serving businesses and gamers who like to know who they're dealing with." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Squinix" title="Technology should empower people." lead="Squinix Solutions supplies the hardware that businesses and gamers rely on, and the consulting that helps them use it well." />

      <section className="relative bg-ink py-24 md:py-40">
        <div className="container-x">
          <p className="eyebrow">Our belief</p>
          <WordHighlight
            className="display-3 mt-8 max-w-[28ch] !font-medium !tracking-[-0.03em] md:!text-[clamp(2rem,4vw,4rem)]"
            text="Our journey is built on a simple belief: technology should empower people and businesses. From solving small IT challenges to delivering enterprise-level hardware solutions, we aim for systems that are smarter, faster and more reliable."
          />
        </div>
      </section>

      <section className="relative bg-ink-2 py-28 md:py-40">
        <div className="container-x">
          <p className="eyebrow">How we work</p>
          <SplitReveal className="display-2 mt-6 max-w-[14ch]">Four things we hold ourselves to.</SplitReveal>
          <Reveal stagger={0.1} className="mt-16 grid gap-4 md:grid-cols-2">
            {principles.map((p, i) => (
              <article key={p.title} className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-ink p-8 md:p-10">
                <span aria-hidden data-n={`0${i + 1}`} className="watermark absolute right-8 top-6 font-mono text-5xl font-semibold text-white/[0.05] transition-colors duration-500 group-hover:text-sky/20" />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/10 text-sky">
                  <Icon name={p.icon} size={22} />
                </span>
                <h3 className="mt-10 text-2xl font-semibold tracking-tight text-white">{p.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-mute">{p.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-28 md:py-40">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="eyebrow">Find us</p>
            <SplitReveal className="display-2 mt-6 max-w-[12ch]">Based in Noida West.</SplitReveal>
            <p className="lead mt-6 max-w-md">{site.name}. Call, message or drop in a request, and we&apos;ll take it from there.</p>
            <address className="mt-8 space-y-2 not-italic text-fog/85">
              <p>{site.address.line}</p>
              <p>
                <a href={`tel:${site.phone.tel}`} className="hover:text-white">{site.phone.display}</a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
              </p>
            </address>
            <div className="mt-8">
              <Button href={site.address.mapsUrl} variant="ghost">
                Open in Google Maps
              </Button>
            </div>
          </div>
          <Reveal>
            {/* stylised map card - no embed, no API key, works offline */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-ink-2">
              <svg aria-hidden viewBox="0 0 400 300" className="absolute inset-0 h-full w-full text-white/10" fill="none" stroke="currentColor" strokeWidth="1">
                {Array.from({ length: 11 }).map((_, i) => (
                  <path key={`v${i}`} d={`M${i * 40} 0 V300`} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <path key={`h${i}`} d={`M0 ${i * 40} H400`} />
                ))}
                <path d="M-10 220 C 90 200, 140 120, 230 130 S 340 60, 420 40" strokeWidth="6" className="text-white/[0.07]" />
                <path d="M120 -10 C 140 90, 200 150, 190 320" strokeWidth="5" className="text-white/[0.07]" />
              </svg>
              <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 -m-4 animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-sky/40" />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-sky text-ink shadow-[0_0_60px_var(--color-sky)]">
                  <Icon name="pin" size={24} strokeWidth={2} />
                </span>
              </div>
              <p className="absolute bottom-5 left-6 font-mono text-xs uppercase tracking-[0.25em] text-mute">Noida West · UP · 201306</p>
            </div>
          </Reveal>
        </div>
      </section>

      <QuoteSection title="Say hello." />
    </>
  );
}
