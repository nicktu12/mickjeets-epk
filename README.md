# Mick Jeets — Electronic Press Kit

Single-page EPK for Denver-based electronic producer/DJ Mick Jeets. Live at
[mickjeets.com](https://mickjeets.com).

## Stack

Plain HTML/CSS/JS, no build step or dependencies. GSAP + ScrollTrigger (via CDN) power the
scroll-reveal animations.

- `index.html` — page content
- `styles.css` — styling
- `script.js` — scroll reveals + photo/video lightbox
- `assets/` — logos, photos, video, Spotify editorial placement covers

## Local preview

```
python3 -m http.server 8834
```

Then open `http://localhost:8834`.

## Deploy

Hosted on GitHub Pages from the `main` branch (custom domain via the `CNAME` file). Pushing
to `main` is the entire deploy:

```
git add -A && git commit -m "..." && git push
```

## Updating content

See `.claude/skills/epk-update/SKILL.md` for the established workflow (and known gotchas)
around adding photos, shows, and Spotify editorial placements.
