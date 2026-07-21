---
name: epk-update
description: Update the Mick Jeets EPK site (mickjeets.com, repo nicktu12/mickjeets-epk) — photos, shows/gigs, Spotify editorial placements, and deploys — using the established workflow and known gotchas instead of re-deriving them from scratch each time. Use when the user asks to add or change photos, gigs/shows, playlist placements, or other content on the Mick Jeets EPK site, or asks to deploy/push updates to it.
---

# Mick Jeets EPK Update Skill

Site: `/Users/nickteets/Projects/mickjeets-epk` — single-page `index.html` + `styles.css` +
`script.js`, no build step. Live at **https://mickjeets.com**, deployed via GitHub Pages from
the `main` branch of the public repo `nicktu12/mickjeets-epk`. **Pushing to `main` is the
entire deploy** — there is no separate build/deploy command.

## Before making changes

- **Local preview**: check whether a dev server is already running on :8834
  (`curl -s -o /dev/null -w "%{http_code}" localhost:8834`); if not,
  `cd /Users/nickteets/Projects/mickjeets-epk && python3 -m http.server 8834 &`.
- **Screenshot workflow**: when the user says "see latest ss," they mean the newest file in
  `~/Desktop/screenshots/` — run `ls -lat ~/Desktop/screenshots | head -3` and Read the most
  recent one directly. Don't wait for an image attachment.
- **Don't auto-commit every small tweak.** Let changes sit uncommitted through a round of
  back-and-forth iteration; commit at a natural checkpoint or when explicitly asked.
- **Any CSS edit needs a cache-busting version bump**: `<link rel="stylesheet"
  href="styles.css?vN">` in `index.html` — bump `N`. Without this the browser serves a stale
  cached copy and edits appear to silently do nothing.

## Adding/updating photos

- Sources are usually: local `~/Downloads`/`~/Desktop` (match by the exact filename/timestamp
  given), or the connected Google Drive (`mickjeets@gmail.com` account, via
  `mcp__claude_ai_Google_Drive__*` tools) when referenced by a Drive link.
- Always resize/compress before adding to `assets/photos/` — originals are multi-MB:
  `sips -Z 1600 --setProperty formatOptions 78 <file>`
- **Verify distinctness, don't trust filenames alone**: `md5 file1 file2` before assuming two
  sourced images actually differ. (Real incident this project hit: two "different" source
  files were byte-identical after resize, creating a silent duplicate in the gallery.)
- Gallery grid (`#gallery .gallery-grid`): 4 columns, `grid-auto-rows: 200px`. Up to two tiles
  may carry `.span-2` (2 cols × 2 rows) as a "hero pair" in the top row; everything else is a
  plain 1×1 tile filled in DOM order.
- When adding/reordering, don't place visually-similar shots (same venue/lighting/composition)
  next to each other in DOM order.
- Keep the gallery curated — roughly 8–12 tiles, not an ever-growing dump of everything sent.

## Adding/updating shows (Shows section)

- List lives in `.show-list` in `index.html`, one `<li>` per show:
  `<span class="show-role">` / `<span class="show-venue">` (venue **and** city combined, e.g.
  `"Larimer Lounge, Denver, CO"`) / `<span class="show-date">`.
- **Sort newest-first by date** whenever the list changes.
- **CSS gotcha — do not "fix" this back**: `.show-list li` uses `display:grid` on the `<li>`
  itself rather than a shared parent, so each row is its own independent grid. If the date
  column were `auto`-width, it would recompute per-row based on that row's own text and
  misalign every row. The date column is deliberately a **fixed pixel width**
  (`grid-template-columns: 1.3fr 1.4fr 110px`) — keep it fixed.
- The upcoming-show card (`.upcoming-card`) is separate markup above the list: title (or
  "TBA") / date / location stacked vertically, with "Inquire to Book" as its own CTA
  *below* the card, not inside it.

## Adding new Spotify editorial placements (accolade cards)

This is a repeatable, semi-automatable flow — pull the details, don't just ask the user to
type them out:

1. Search Gmail (`mickjeets@gmail.com`, via `mcp__claude_ai_Gmail__search_threads`) for
   `"was added to this playlist"` to find Spotify for Artists notification emails.
2. `get_message` (format `FULL_CONTENT`) on each — the response is large and gets saved to a
   tool-results file; read the `plaintextBody` field for track name / playlist name /
   follower count.
3. **The actual playlist cover art is only in `htmlBody`, not plaintext** — grep the saved
   file for `<img ... alt="Playlist Image" ... src="https://i.scdn.co/image/...">`. That URL
   is Spotify's public CDN and needs no auth: `curl -sL <url> -o
   assets/covers/cover-<slug>.jpg`.
4. Resize: `sips -Z 240 --setProperty formatOptions 85 <file>`.
5. Add a new `.accolade-card` to `.accolades-grid`: the cover `<img class="accolade-cover">`
   (fills the card width — not a small floating thumbnail) followed by a
   `<div class="accolade-info">` with playlist name / rounded follower count (e.g. "209K",
   "1.2M") / track name in curly quotes.

## Deploying

```
git add -A && git commit -m "..." && git push
```
That's it — GitHub Pages rebuilds automatically from `main`. Verify with:
```
curl -s -o /dev/null -w "%{http_code}\n" https://mickjeets.com
```
should print `200` within well under a minute of the push landing.

If HTTPS/cert issues ever recur (shouldn't — it's provisioned and enforced) or the custom
domain is changed: don't just re-save the domain, it can get stuck in a dead "new" state
indefinitely. Force a fully fresh certificate request instead:
```
gh api -X DELETE repos/nicktu12/mickjeets-epk/pages
gh api -X POST repos/nicktu12/mickjeets-epk/pages -f "source[branch]=main" -f "source[path]=/"
```

## CSS pitfalls specific to this codebase

- **Never put a permanent `transform` on an element that also has `data-reveal`.** The GSAP
  scroll-reveal animation (`script.js`) sets its own inline `transform` on an element when it
  plays, which *completely overwrites* any CSS `transform` declared for that element — not
  additive. If something needs both a scroll-reveal animation and a fixed transform (e.g. a
  zoom), split it into a wrapper (`data-reveal` goes here) with an inner element (the fixed
  transform goes here instead).
- **`transform: scale()` on an element that also defines its own clip boundary
  (`border-radius` + `overflow:hidden`) scales the clip boundary along with the content** —
  it does not "zoom into a fixed frame," it just renders the same crop bigger. For a
  zoom-into-a-fixed-frame effect, use a fixed-size wrapper for the clip/border/shadow, and put
  the `object-fit`/`object-position`/scale on a full-width/height child inside it.
