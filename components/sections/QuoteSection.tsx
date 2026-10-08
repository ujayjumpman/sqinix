import { QuoteForm } from "./QuoteForm";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

/** Two-column quote block: pitch + direct contacts on the left, the form on the right. */
export function QuoteSection({ id = "quote", title = "Tell us what you need.", defaultInterest }: { id?: string; title?: string; defaultInterest?: string }) {
  return (
    <section id={id} className="relative scroll-mt-24 overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-brand/10 blur-[130px]" />
      <div className="container-x relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Request a quote</p>
          <SplitReveal className="display-2 mt-6 max-w-[12ch]">{title}</SplitReveal>
          <p className="lead mt-6 max-w-md">Share a few details and we&apos;ll come back with a clear recommendation and a price: no jargon, no pressure.</p>
          <Reveal className="mt-10 space-y-4">
            {[
              { icon: "phone", label: "Call", value: site.phone.display, href: `tel:${site.phone.tel}` },
              { icon: "whatsapp", label: "WhatsApp", value: site.whatsapp.display, href: whatsappLink() },
              { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}` },
            ].map((c) => (
              <a key={c.label} href={c.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-white/[0.03] p-4 transition-colors hover:border-sky/50 hover:bg-white/[0.06]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky/10 text-sky">
                  <Icon name={c.icon} size={20} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-mute">{c.label}</span>
                  <span className="block text-[1.02rem] text-white">{c.value}</span>
                </span>
                <Icon name="arrow-up-right" size={18} className="ml-auto text-mute transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky" />
              </a>
            ))}
          </Reveal>
        </div>
        <Reveal>
          <QuoteForm defaultInterest={defaultInterest} />
        </Reveal>
      </div>
    </section>
  );
}
