"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { defaultWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

/** Click-to-chat button that appears once the visitor has scrolled a little. */
export function FloatingContact() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <aside aria-label="Quick contact">
    <a
      href={whatsappLink(defaultWhatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Squinix on WhatsApp"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#1bd16b] p-3.5 text-ink shadow-[0_12px_40px_-8px_rgb(27_209_107/0.55)] transition-all duration-500 hover:pr-5 md:bottom-7 md:right-7 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="absolute inset-0 -z-10 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-[#1bd16b]/50" />
      <Icon name="whatsapp" size={22} strokeWidth={2} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-500 group-hover:max-w-[9rem] group-hover:opacity-100">Chat with us</span>
    </a>
    </aside>
  );
}
