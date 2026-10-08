# Squinix website (revamp)

A cinematic, scroll-driven rebuild of squinix.com for Squinix Solutions Private Limited (IT hardware, gaming hardware and consulting, Noida West).

- **Stack:** Next.js (App Router, static export) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis smooth scroll
- **Output:** a fully static `out/` folder - no server needed. It runs from a laptop with no internet connection, and the same folder can be uploaded to the existing Apache host or deployed to Vercel.

## Run it

```bash
npm install
npm run dev        # development at http://localhost:3000
npm run demo       # production build + serve on your LAN (open the printed address on a phone)
npm run build      # build only -> out/
npm run smoke      # end-to-end test (build first). Add --shots for screenshots, --reduced for reduced-motion
```

`npm run demo` serves on `0.0.0.0:3000`, so a phone on the same Wi-Fi can open `http://<laptop-ip>:3000` - the best way to show customers the scroll films on a real device.

## What's in the site

| Route | What it is |
|---|---|
| `/` | Hero loop video · statement · **PC-assembly film** · pinned horizontal product showcase · **server-aisle film** · services bento · process · testimonials · quote form |
| `/products/gaming/` `business/` `infrastructure/` `peripherals/` | One template (`app/products/[line]/page.tsx`), four product lines: a scroll film, highlights, range cards, "why us", quote form |
| `/services/` | Four consulting services with a sticky illustration that swaps as you scroll |
| `/about/`, `/contact/` | Story/principles/location; contact cards and the quote form |

### How the "Apple-style" films work

`components/motion/ScrollSequence.tsx` is a tall section holding a sticky full-screen `<canvas>`. Scroll progress picks a frame number and the frame is painted on the canvas. Frames are small WebP files fetched progressively (coarse first so scrubbing works immediately) and decoded on demand into a bounded cache, so even a 150-frame film uses modest memory. Text "beats" fade in and out at set progress windows. Reduced-motion and data-saver visitors get a static layout instead. Phones get a lighter portrait frame set.

## The product visuals

All imagery is **procedurally rendered** (three.js scenes in `scripts/render/scenes/`) so there are no third-party licensing questions - the free stock libraries we checked either restricted data-centre clips to personal use or had no hardware product shots.

```bash
node scripts/render-all.mjs                  # render every film + hero loop (about 5 minutes)
node scripts/render-all.mjs --only gpu,rig   # just some
```

Scenes: `rig` (home PC assembly), `gpu` (gaming), `laptop` (business), `servers` (infrastructure + home), `keyboard` (peripherals), `hero` (looping hero video).

### Swapping in Squinix's own footage

When real product footage exists, drop it in - no code changes:

```bash
# a turntable / orbit clip -> scroll film
node scripts/make-sequence.mjs path/to/clip.mp4 gpu --frames 120                          # desktop
node scripts/make-sequence.mjs path/to/clip-portrait.mp4 gpu --variant mobile --frames 72 # phones
# a loop for the hero
node scripts/make-video.mjs path/to/hero.mp4 hero
# 3:2 stills used on cards and the mega menu (grabs frames from the new sequences)
node scripts/make-cards.mjs --from-seq
```

See `SHOT-LIST.md` for how to film it.

## Configuration

| Setting | Where |
|---|---|
| Phone numbers, email, address, social links, CIN | `content/site.ts` |
| Product lines, highlights, ranges | `content/products.ts` |
| Consulting services and process | `content/services.ts` |
| Testimonials | `content/testimonials.ts` |
| Quote-form delivery | env var `NEXT_PUBLIC_FORM_ENDPOINT` (see below) |

### Making the quote form send real enquiries

With no endpoint set, the form runs in **demo mode** (shows the success state, sends nothing). For launch, create a free form endpoint (for example Web3Forms or Formspree) and build with it set:

```bash
# .env.local
NEXT_PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit   # add the service's access key per its docs
```

The **Send via WhatsApp** button always works - it opens a pre-filled chat with `+91 88009 69632`.

## Going live

1. `npm run build` -> upload the **contents** of `out/` to the web root of the Apache host (cPanel File Manager or FTP). `public/.htaccess` is already included: it redirects the old `*.html` URLs, sets caching/compression and the 404 page.
2. Once SSL is active, uncomment the HTTPS redirect in `.htaccess`.
3. Or deploy to Vercel / Netlify / Cloudflare Pages: connect the repo, build command `npm run build`, output directory `out`, then point the domain's DNS there.
4. Before launch, work through `CONTENT-CHECKLIST.md`.

## Project map

```
app/            routes, layout, sitemap, robots, 404, page transition (template.tsx)
components/
  motion/       ScrollSequence, SmoothScroll, SplitReveal, Reveal, WordHighlight
  layout/       Nav (+ mega menu), Footer, Preloader, FloatingContact
  sections/     Hero, ProductShowcase, ServicesBento, ProcessTimeline, Testimonials, QuoteForm, ...
  media/        LoopVideo
content/        all copy and company data
lib/            GSAP setup, hooks, WhatsApp links
scripts/        render pipeline, media encoders, logo tracing, smoke test, postbuild
public/         brand logo SVGs, media (sequences + video), .htaccess
```

## Notes

- `scripts/postbuild.mjs` writes flat copies of Next's prefetch files so link prefetching works on plain static servers (a Windows build otherwise emits nested folders the client does not request).
- The logo in `public/brand/` was vectorised from the PNG on the current site. Replace it with the client's original vector artwork if they have it.
