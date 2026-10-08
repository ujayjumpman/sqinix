# Shot list - filming Squinix's own product footage

The site's scroll films are currently rendered in 3D. Real footage will look even better and is a drop-in replacement (see README, "Swapping in Squinix's own footage").

## Equipment
- A recent phone on a tripod (4K, 24 or 30 fps) is enough; a mirrorless camera is better.
- A black or very dark seamless backdrop (black cloth, matte card or a dark table).
- A turntable (a manual lazy-susan is fine) for the product, or a slider/gimbal to move the camera instead.
- Two or three soft lights: one large key from the front-left, one cool rim light behind. Avoid harsh overhead light and reflections of the room in glossy surfaces.

## Settings
- **Lock** exposure, white balance and focus. Any auto adjustment flickers when scrubbed.
- 4K if possible. Keep the product centred with room around it (we crop to 16:9 on desktop and 3:4 on phones).
- Remove or cover brand logos you are not licensed to show.

## Shots

| Film | Subject | Move | Length |
|---|---|---|---|
| Home - "built, not assembled" | A PC build with the side panel off | Slow 360 orbit, RGB on. Optionally a second take of parts being placed | 8 - 10 s |
| Gaming | A graphics card or a finished rig | 360 orbit, then a push-in on the fans | 8 s |
| Business | A laptop on a desk | Lid opening, then a slow push to the screen | 8 s |
| Infrastructure | A rack or the server room | Slow forward dolly down the aisle | 10 s |
| Peripherals | A keyboard, mouse and headset | Overhead-to-3/4 orbit, keys lit | 8 s |
| Hero loop | The most striking product, fans/lights moving | Gentle drift, ideally loops | 6 s |

For phones, repeat each shot in **portrait** (3:4 or 9:16), subject centred in the upper two thirds.

## Delivering
Send the original clips (not exports from social apps). Run:

```bash
node scripts/make-sequence.mjs clip.mp4 gpu --frames 120
node scripts/make-sequence.mjs clip-portrait.mp4 gpu --variant mobile --frames 72
```

Names: `rig` (home), `gpu` (gaming), `laptop` (business), `servers` (infrastructure), `keyboard` (peripherals). The scroll "beats" (text) are timed in `app/page.tsx` and `app/products/[line]/page.tsx`; adjust their `from`/`to` if the new footage tells its story at different moments.
