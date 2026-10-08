import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrollSequence, type SequenceBeat } from "@/components/motion/ScrollSequence";
import { Button } from "@/components/ui/Button";
import { Configs, Highlights, LocalNav, RelatedLines, Why } from "@/components/sections/ProductSections";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { productBySlug, products } from "@/content/products";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ line: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ line: string }> }): Promise<Metadata> {
  const { line } = await params;
  const p = productBySlug(line);
  if (!p) return {};
  return {
    title: p.name,
    description: p.metaDescription,
    alternates: { canonical: `/products/${p.slug}/` },
    openGraph: { title: `${p.name} | Squinix`, description: p.metaDescription, images: [{ url: `/media/sequences/${p.sequence}/card.webp`, width: 1200, height: 800 }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ line: string }> }) {
  const { line } = await params;
  const p = productBySlug(line);
  if (!p) notFound();

  // hero beat first, then the four story beats spread over the remaining scroll
  const windows: [number, number, SequenceBeat["align"]][] = [
    [0.17, 0.38, "left"],
    [0.41, 0.61, "right"],
    [0.64, 0.82, "left"],
    [0.85, 1, "center"],
  ];
  const beats: SequenceBeat[] = [
    {
      from: 0,
      to: 0.14,
      size: "hero",
      align: "center",
      eyebrow: p.short,
      title: p.headline,
      body: p.summary,
      cta: (
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="#quote">Get a quote</Button>
          <Button href="#highlights" variant="ghost" arrow={false}>
            See what we supply
          </Button>
        </div>
      ),
    },
    ...p.beats.map((b, i) => ({ from: windows[i][0], to: windows[i][1], align: windows[i][2], eyebrow: b.eyebrow, title: b.title, body: b.body })),
  ];

  return (
    <>
      <ScrollSequence name={p.sequence} label={`${p.name} film`} beats={beats} scrollVh={620} />
      <LocalNav product={p} />
      <Highlights product={p} />
      <Configs product={p} />
      <Why product={p} />
      <RelatedLines current={p.slug} />
      <QuoteSection title="Ready when you are." defaultInterest={p.quoteInterest} />
    </>
  );
}
