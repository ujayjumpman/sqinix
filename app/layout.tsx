import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Preloader } from "@/components/layout/Preloader";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Squinix | IT hardware, gaming PCs & consulting in Noida",
    template: "%s | Squinix",
  },
  description: site.description,
  applicationName: "Squinix",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Squinix Solutions",
    title: "Squinix | IT hardware, gaming PCs & consulting",
    description: site.description,
    url: site.url,
    locale: "en_IN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Squinix Solutions" }],
  },
  twitter: { card: "summary_large_image", title: "Squinix Solutions", description: site.description, images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: site.phone.tel,
  description: site.description,
  image: `${site.url}/og.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.address.street,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  areaServed: "IN",
};

// Runs before first paint: repeat visitors and reduced-motion users skip the intro.
const preloadGate = `try{if(sessionStorage.getItem('sqx-v')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('skip-preload')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloadGate }} />
        <noscript>
          <style>{`.preloader{display:none!important}.reveal-init{opacity:1!important;transform:none!important}[style*="visibility:hidden"]{visibility:visible!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-ink">
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
