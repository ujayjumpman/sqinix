import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & quotes",
  description: "Call, WhatsApp or email Squinix Solutions in Noida West, or send a quote request for gaming PCs, business computers, servers and IT consulting.",
  alternates: { canonical: "/contact/" },
};

const cards = [
  { icon: "phone", label: "Call us", value: site.phone.display, href: `tel:${site.phone.tel}`, note: "Talk to the team" },
  { icon: "whatsapp", label: "WhatsApp", value: site.whatsapp.display, href: whatsappLink(), note: "Fastest reply" },
  { icon: "mail", label: "Email", value: site.email, href: `mailto:${site.email}`, note: "For quotes and documents" },
  { icon: "pin", label: "Visit", value: site.address.line, href: site.address.mapsUrl, note: "Open in Google Maps" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk hardware." lead="Pick whichever way suits you. We usually reply fastest on WhatsApp." />
      <section className="relative bg-ink pb-8">
        <div className="container-x">
          <Reveal stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex min-h-[14rem] flex-col justify-between rounded-[1.5rem] border border-line bg-ink-2 p-7 transition-colors duration-300 hover:border-sky/50 hover:bg-white/[0.05]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/10 text-sky transition-transform duration-500 group-hover:-rotate-6">
                  <Icon name={c.icon} size={22} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mute">{c.label}</p>
                  <p className="mt-2 break-words text-lg font-medium text-white">{c.value}</p>
                  <p className="mt-1 text-sm text-mute">{c.note}</p>
                </div>
              </a>
            ))}
          </Reveal>
        </div>
      </section>
      <QuoteSection title="Request a quote." />
    </>
  );
}
