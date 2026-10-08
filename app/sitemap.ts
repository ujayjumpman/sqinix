import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["/", "/services/", "/about/", "/contact/", ...products.map((p) => `/products/${p.slug}/`)];
  return pages.map((path) => ({ url: `${site.url}${path}`, lastModified: now, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }));
}
