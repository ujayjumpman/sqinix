# Content checklist - confirm with Squinix before launch

Everything below is placeholder, inferred, or carried over from the old site and needs a yes/no from the client. Search the code for `TODO(client)` to find each one.

## Contact details
- [ ] **Phone numbers.** The old site showed three: `+91 8383921743`, `+91 8800969632` (WhatsApp) and `+91 8000 96932` in the header (only 9 digits, so invalid). The new site uses the first two. Which should be primary?
- [ ] Email `info@squinix.com` is correct and monitored.
- [ ] Full street address (currently only "Noida West, UP - 201306"), opening hours, and whether walk-in visits are welcome.
- [ ] Social profile links (Instagram, Facebook, LinkedIn, X). Icons appear automatically once added to `content/site.ts`.

## Legal / trust
- [ ] CIN and registered office address (customary in the footer of an Indian private limited company) -> `site.legal` in `content/site.ts`.
- [ ] Privacy policy and terms pages (the quote form collects names and phone numbers).
- [ ] Permission to publish the four testimonials, plus each person's company/role (the old site labelled all four just "Businessman").

## Products
- [ ] Which product lines are actually stocked and sold (gaming PCs, business laptops/desktops, servers/networking, peripherals).
- [ ] Brands carried. **No brand names or logos are shown** - add them (and "authorised partner" wording) only if the relationship is real.
- [ ] The Entry / Pro / Extreme (and equivalent) range cards in `content/products.ts` are generic starting points - replace with real configurations.
- [ ] Pricing policy. Everything currently says "on request".
- [ ] Warranty terms, delivery area, installation and AMC/support offering.
- [ ] Bulk / gaming-café order policy.

## Claims to verify
The copy describes a typical good process. Confirm each is true or edit it:
- [ ] "Burn-in and stress runs before it ships" (home page film)
- [ ] "Assembled with care / clean cable routing"
- [ ] "Imaged, updated and labelled for each user" (business line)
- [ ] "Installed, racked, cabled, labelled and documented" (infrastructure line)
- [ ] "Redundancy and backup built into the design"
- [ ] Consulting scope and delivery for the four services.

## About page
- [ ] Founding story, year founded, founders/team, and real numbers. None are published anywhere, so none are invented.

## Visuals
- [ ] Original logo as a vector file (SVG/AI/EPS). The current one is a traced PNG.
- [ ] Real product photos or footage (see `SHOT-LIST.md`) to replace the rendered films.
- [ ] Hero loop video approval.

## Technical
- [ ] Form service account (Web3Forms / Formspree) and the endpoint set in `NEXT_PUBLIC_FORM_ENDPOINT`.
- [ ] Domain / DNS access and whether to stay on the current Apache host or move to Vercel.
- [ ] Google Analytics / Search Console IDs, if wanted.
- [ ] The old site embedded a Google Maps API key in its page source. Revoke or restrict that key in Google Cloud - it is public.
