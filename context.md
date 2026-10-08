# Context: the Squinix website revamp

A record of the whole conversation and the work that came out of it, so anyone (or any future session) can pick the project up cold. For the technical "how it works" see [explanation.md](explanation.md).

## 1. Who and what

- **Group:** UKJ Group. Its first venture is **UKJTech** (AI, software, robotics, automation). Other planned verticals (UKJPower & Infra, UKJRealty, UKJEntertainment, UKJManufacturing) are shown in `UKJ Group/Vision.png` but are not started.
- **This project:** a complete revamp of **squinix.com**, the site of **Squinix Solutions Private Limited** (Noida West, U.P. 201306), a company that sells IT hardware and gaming hardware and offers IT consulting.
- **Location on disk:** `C:\Users\utkku\OneDrive\Desktop\UKJ Group\UKJTech\website-revamp\squinix\` (this folder).
- **Date of work:** 8 October 2026.

## 2. Conversation timeline

| # | What the user asked | What happened |
|---|---|---|
| 1 | "Go and research and understand everything about this site squinix.com" | Fetched the home, About, Services, Projects and Contact pages and searched the web. Findings in section 3. |
| 2 | "Our goal is to do a revamp ... a complete makeover, animations, movements fully dynamic, it sells hardware so inclusion of video like how it shows in an Apple website" (plan mode on, model switched to Opus) | Inspected the workspace (found `Vision.png` and an empty `UKJTech/website-revamp/squinix` folder), pulled the old site's raw HTML/CSS and logo, and asked four scoping questions. |
| 3 | Answers to the questions | **Showcase + enquiry** (no shop); **video sequences** for the Apple-style visuals; **host later** (show the customer locally first); **all four** product lines get cinematic pages. A detailed plan was written to the plan file. |
| 4 | Rejected the plan twice: "explain the plan to me first in short and briefly and in simpler terms", then "explain here in simpler terms first and stop" | Gave a short 7-point plain-language summary and stopped. (Saved as a feedback memory: explain plans briefly in simple terms first.) |
| 5 | "Okay implement this plan and do all the work in squinix folder, follow the plan all along." (model switched to Sonnet) | Built the whole site (sections 4 to 7). |
| 6 | "how to run this?" | Gave the run instructions (`npm run demo`, LAN address for phones, other commands). |
| 7 | "create a context.md ... and an explanation.md" | These two files. |

Two stray automated "background task finished" notifications arrived during the work; they were not user messages and needed no action.

## 3. Research findings on the old squinix.com

- A **stock Colorlib Bootstrap + jQuery template** (Apache server, jQuery 3, Owl Carousel, AOS, Scrollax, Flaticon fonts) with a Squinix logo and a few real paragraphs dropped in.
- **Real content:** company name, address (Noida West, U.P. 201306), contact details, six service names (IT Strategy Consulting, Custom Application Development, Digital Transformation, Gaming Hardware, Business Process Consulting, IT Hardware), a "success story" paragraph, four testimonials (Deepak Kumar, Ashish Sharma, Raj Kumar, Ramesh Yadav, all labelled just "Businessman").
- **Unfinished:** About, Services and Projects pages said "Under Construction"; most links were `#`; lorem ipsum ("Far far away, behind the word mountains...") in the features, section blurbs and quote form; blog posts were identical placeholders dated June 2019; the Request-a-Quote dropdown was copied from a finance template (Auto Loan, Real Estate); the newsletter, search box and social icons went nowhere.
- **Defects:** three different phone numbers (`+91 8383921743`, `+91 8800969632` for WhatsApp, and a header number `+91 8000 96932` that has only 9 digits); the contact page email link pointed to `info@yoursite.com`; a **Google Maps API key was exposed in the page source** (should be revoked).
- **Brand:** logo is a PNG with a two-ribbon blue "S" mark (navy to sky-blue gradient) and a "SQUINIX" wordmark in about `#1185B9`. The old CSS used `#1B9CE3` and `#1566AD`.
- **Web search:** no independent listings for squinix.com (search results were about Square Enix).

## 4. Decisions made (and why)

| Decision | Why |
|---|---|
| Showcase + enquiry, **no shopping cart** | Matches how B2B hardware is sold in India (quotes, bulk pricing); fastest to ship. |
| **Static export** (Next.js `output: "export"`) | The customer demo runs from a laptop with no internet; the same folder can later go to the existing Apache host or Vercel. |
| **Scroll-scrubbed frame sequences on `<canvas>`** (Apple's technique) | Gives the "video that moves as you scroll" feel with total control and small files. |
| **Frames are rendered in 3D by us, not stock footage** | Deviation from the plan. Mixkit's free data-centre clips are licensed for personal use only, and no free source had GPU, laptop or server product shots. Self-rendered visuals have no licensing risk and match the brand. Real footage can replace them with the same scripts. |
| All four product lines, each with its own film | Gaming (GPU), Business (laptop), Infrastructure (server aisle), Peripherals (keyboard). |
| Dark, cinematic design using brand blues | Suits gaming hardware and the Apple-style look. |
| **No prices, brands, or invented stats** | Nothing verified was available; everything unconfirmed is flagged `TODO(client)` and listed in CONTENT-CHECKLIST.md. |
| Dropped Projects page, blog, newsletter, search | They were empty placeholders. |
| Quote form works without a backend | Demo mode, WhatsApp pre-fill, and an optional form-service endpoint. |

## 5. What was built

**Pages:** Home (`/`), four product pages (`/products/gaming|business|infrastructure|peripherals/`), Services, About, Contact, and a custom 404.

**Home page flow:** intro preloader, full-screen hero loop video, scrolling word marquee, word-by-word highlighted statement, **PC-assembly scroll film**, pinned sideways product showcase, **server-aisle scroll film**, consulting-services bento (light section), "how we work" timeline, testimonials carousel, quote form.

**Product page flow:** scroll film (the opening beat is the headline), sticky sub-nav, highlights grid, range cards (Entry / Pro / Extreme style), "why Squinix", related lines, quote form.

**Everything else:** mega-menu nav, full-screen mobile menu, page-transition curtain, floating WhatsApp button, SEO (metadata, sitemap, robots, Open Graph image, JSON-LD), favicon and app icons, `.htaccess` for Apache.

**Media produced (procedurally):** five scroll films (`rig`, `gpu`, `laptop`, `servers`, `keyboard`) at desktop (120 to 150 frames, 1440 px) and phone (72 to 90 frames, 720x960) sizes, a 6-second seamless hero loop (landscape and portrait, MP4 + WebM), and 3:2 card stills. Total media is about 39 MB across 1,171 files in the build; each film is 1.4 to 6.2 MB.

## 6. Verification results (final state)

- `tsc`, `eslint`: clean. `next build`: 14 static pages generated.
- `npm run smoke` (Playwright, 9 routes x desktop + phone): all clean. No console errors, no failed requests, **no external network requests**, no horizontal overflow, no placeholder links, every film's painted frame advances monotonically through all frames; reduced-motion variant also passes.
- `npm run a11y` (axe-core): **no serious or critical violations** on any route/size.
- **Lighthouse** (served build): home desktop 97, gaming page desktop 98 (LCP 0.8 to 1.0 s, CLS 0 to 0.002, TBT 0 ms). On the simulated slow-mobile profile: home 78, gaming 85. A hand-throttled real test measured the home page's main content at about 1.8 s; the simulated number is partly a model artifact. Accessibility 97 to 100, Best Practices 100, SEO 100.
- Dev mode check: no hydration warnings.

## 7. Problems met and how they were fixed

| Problem | Fix |
|---|---|
| Free stock footage unusable (licence + no hardware shots) | Built the 3D render pipeline instead. |
| Glass panel blocked the PC film; overexposed laptop; blown-out server aisle | Retuned lighting, camera path and bloom per scene. |
| Hero text overlapped the product on product pages and the phone hero was a bad crop | Added an in-frame "shift" for opening frames, rendered a dedicated portrait hero. |
| Link prefetch 404s on a Windows build (Next writes nested prefetch folders, client asks for flat names) | `scripts/postbuild.mjs` writes the flat copies. |
| Lint errors from setState-in-effect | Replaced with `useSyncExternalStore` hooks and derived state. |
| Accessibility findings (decorative text contrast, unfocusable scroller, heading levels, button outside landmark) | Fixed each (see `components/`). |
| Slow LCP because hero copy was hidden until JS ran, 2.2 MB WebM chosen first, all film frames fetched at load | Hero copy ships visible (the preloader still covers it), MP4 listed first, video and frames deferred until after load and fetched at low priority, shorter intro. LCP went from 6.3 s to 1.0 s on desktop. |
| 823 MB of scratch renders inside OneDrive | Deleted `scripts/.tmp`. |

## 8. Open items for the client

All are in [CONTENT-CHECKLIST.md](CONTENT-CHECKLIST.md). The main ones: which phone number is primary, CIN and registered address for the footer, permission to publish the testimonials (and their real roles), confirmation that the build/test process claims are true, brands carried and warranty terms, the original vector logo, real product footage, a form-service account, domain/DNS access, and revoking the exposed Google Maps API key on the old site.

## 9. Housekeeping notes

- The project lives in OneDrive, so `node_modules`, `.next` and `out` sync; consider excluding them.
- `scripts/.tmp/` is a disposable scratch folder (git-ignored). `media-src/` holds the original logo PNG (git-ignored).
- `AGENTS.md` was generated by Next.js and tells AI agents to read the bundled docs in `node_modules/next/dist/docs/` because this Next version (16.4) differs from older ones. It is worth keeping.
- No git commits were made (none were requested); `create-next-app` initialised an empty repo.
- Memory notes for future sessions were saved under `C:\Users\utkku\.claude\projects\...\memory\`.

## 10. How to run (quick reference)

```bash
cd "C:\Users\utkku\OneDrive\Desktop\UKJ Group\UKJTech\website-revamp\squinix"
npm run demo      # build + serve at http://localhost:3000 and on your LAN
npm run dev       # development mode
npm run build     # produce out/
npm run smoke     # end-to-end test
npm run a11y      # accessibility scan
```
