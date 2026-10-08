import { site } from "@/content/site";

/** Builds a click-to-chat link. Works with no backend. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultWhatsappMessage = "Hi Squinix, I'd like to know more about your hardware and services.";
