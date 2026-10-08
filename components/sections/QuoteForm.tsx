"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSearch } from "@/lib/hooks";
import { gsap } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icon";
import { products } from "@/content/products";
import { whatsappLink } from "@/lib/whatsapp";

const interests = [...products.map((p) => p.quoteInterest), "IT consulting", "Custom software", "Something else"];

type Status = "idle" | "sending" | "sent" | "demo" | "error";
type Errors = Partial<Record<"name" | "phone" | "email", string>>;

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const field =
  "w-full rounded-2xl border border-line bg-white/[0.04] px-4 py-3.5 text-[0.98rem] text-fog placeholder:text-mute/70 outline-none transition-[border-color,background,box-shadow] duration-300 focus:border-sky focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgb(82_184_236/0.14)] aria-[invalid=true]:border-red-400/70";

/**
 * Quote request. No backend needed to demo:
 *  - with NEXT_PUBLIC_FORM_ENDPOINT set (Web3Forms / Formspree / any JSON endpoint) it POSTs there;
 *  - without it, it runs in demo mode (success state, nothing is sent);
 *  - "Send via WhatsApp" always works and opens a pre-filled chat.
 */
export function QuoteForm({ compact = false, defaultInterest }: { compact?: boolean; defaultInterest?: string }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  // ?interest=...&item=... (set by product/service pages) pre-fills the form; user edits win
  const q = new URLSearchParams(useSearch());
  const qInterest = q.get("interest");
  const qItem = q.get("item");
  const base = {
    name: "",
    company: "",
    phone: "",
    email: "",
    quantity: "",
    interest: qInterest && interests.includes(qInterest) ? qInterest : defaultInterest && interests.includes(defaultInterest) ? defaultInterest : interests[0],
    message: qItem ? `I'm interested in: ${qItem}` : "",
  };
  const [edits, setEdits] = useState<Partial<typeof base>>({});
  const values = { ...base, ...edits };

  useEffect(() => {
    if ((status === "sent" || status === "demo") && doneRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(doneRef.current.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" });
    }
  }, [status]);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setEdits((v) => ({ ...v, [k]: e.target.value }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = "Please tell us your name.";
    if (values.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a phone number with at least 10 digits.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) e.email = "That email doesn't look right.";
    return e;
  };

  const waMessage = () =>
    [
      `Hi Squinix, I'm ${values.name || "(name)"}${values.company ? ` from ${values.company}` : ""}.`,
      `I'm interested in: ${values.interest}.`,
      values.quantity && `Quantity / budget: ${values.quantity}.`,
      values.message && values.message,
      values.phone && `Call me on ${values.phone}.`,
    ]
      .filter(Boolean)
      .join("\n");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("website")) return; // honeypot
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      (formRef.current?.querySelector("[aria-invalid=true]") as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    if (!ENDPOINT) {
      await new Promise((r) => setTimeout(r, 900));
      setStatus("demo");
      return;
    }
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, source: "squinix.com quote form", subject: `Quote request: ${values.interest}` }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent" || status === "demo") {
    return (
      <div ref={doneRef} className="glass rounded-[1.75rem] p-8 md:p-12" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-sky/15 text-sky">
          <Icon name="check" size={26} strokeWidth={2.2} />
        </span>
        <h3 className="display-3 mt-6">Thanks, {values.name.split(" ")[0] || "we've got it"}.</h3>
        <p className="lead mt-4">
          {status === "demo" ? "Demo mode: nothing was sent because no form service is connected yet. " : ""}
          We&apos;ll come back to you shortly. For a faster reply, message us on WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={whatsappLink(waMessage())} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1bd16b] px-6 py-3.5 font-medium text-ink">
            <Icon name="whatsapp" size={18} /> Continue on WhatsApp
          </a>
          <button type="button" onClick={() => setStatus("idle")} className="rounded-full border border-line px-6 py-3.5 text-fog transition-colors hover:bg-white/5">
            Send another
          </button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Errors) => errors[k] && <p id={`${uid}-${k}-e`} className="mt-1.5 text-sm text-red-300">{errors[k]}</p>;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={`glass rounded-[1.75rem] ${compact ? "p-6 md:p-8" : "p-7 md:p-10"}`} aria-label="Request a quote">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="mb-2 block text-sm text-mute">Your name *</label>
          <input id={`${uid}-name`} name="name" autoComplete="name" value={values.name} onChange={set("name")} className={field} placeholder="Full name" aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-e` : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${uid}-company`} className="mb-2 block text-sm text-mute">Company (optional)</label>
          <input id={`${uid}-company`} name="company" autoComplete="organization" value={values.company} onChange={set("company")} className={field} placeholder="Company name" />
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className="mb-2 block text-sm text-mute">Phone *</label>
          <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} className={field} placeholder="+91 …" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-e` : undefined} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="mb-2 block text-sm text-mute">Email (optional)</label>
          <input id={`${uid}-email`} name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={field} placeholder="you@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-e` : undefined} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${uid}-interest`} className="mb-2 block text-sm text-mute">I&apos;m interested in</label>
          <div className="relative">
            <select id={`${uid}-interest`} name="interest" value={values.interest} onChange={set("interest")} className={`${field} appearance-none pr-11`}>
              {interests.map((i) => (
                <option key={i} value={i} className="bg-ink-2">
                  {i}
                </option>
              ))}
            </select>
            <Icon name="down" size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
          </div>
        </div>
        <div>
          <label htmlFor={`${uid}-qty`} className="mb-2 block text-sm text-mute">Quantity or budget (optional)</label>
          <input id={`${uid}-qty`} name="quantity" value={values.quantity} onChange={set("quantity")} className={field} placeholder="e.g. 20 laptops, or ₹1.5 lakh" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${uid}-msg`} className="mb-2 block text-sm text-mute">Tell us a little more</label>
          <textarea id={`${uid}-msg`} name="message" rows={compact ? 3 : 4} value={values.message} onChange={set("message")} className={`${field} resize-none`} placeholder="What will you use it for? Any must-haves?" />
        </div>
        {/* honeypot: real visitors never see or fill this */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-fog px-7 py-4 font-medium text-ink transition-all duration-300 hover:bg-white hover:shadow-[0_10px_50px_-8px_rgb(82_184_236/0.65)] disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Request a quote"}
          <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <a href={whatsappLink(waMessage())} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line px-7 py-4 text-fog transition-colors hover:border-[#1bd16b] hover:bg-[#1bd16b]/10">
          <Icon name="whatsapp" size={18} className="text-[#1bd16b]" />
          Send via WhatsApp
        </a>
      </div>
      <p role="alert" className="mt-4 min-h-5 text-sm text-red-300">
        {status === "error" && "Sorry, that didn't go through. Please try WhatsApp or call us."}
      </p>
    </form>
  );
}
