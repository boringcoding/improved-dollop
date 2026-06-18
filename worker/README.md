# AURA preview Worker (dynamic link previews)

A tiny Cloudflare Worker that gives every share link a **personal** social
preview, while the app itself keeps living for free on GitHub Pages.

It does two things:

1. **`/og`** — generates a 1200×630 PNG on the fly (Satori/`workers-og`):
   - `/og?name=Anna` → that person's aura card (aura name + rarity + glow).
   - `/og?name=A&match=B` → the compatibility card (`A × B` + the %).
2. **`/` (and everything else)** — proxies the static site from GitHub Pages
   and rewrites the `og:`/`twitter:` meta tags + `<title>` per `?name=`/`?match=`,
   so Telegram/Twitter/Facebook/iMessage crawlers (which don't run JS) see the
   right title, description and image for each link.

The aura generation (`src/aura.js`) is a byte-for-byte port of the client logic,
so the preview always matches what the visitor sees.

## Deploy (one time)

```bash
cd worker
npm install
npx wrangler deploy        # needs a Cloudflare account / API token
```

`wrangler` picks up auth from either:
- `wrangler login` (opens a browser), or
- `CLOUDFLARE_API_TOKEN` env var (token with the **“Edit Cloudflare Workers”** template).

After deploy you get a URL like `https://aura-preview.<your-subdomain>.workers.dev`.
Share **that** URL — its links carry the dynamic previews. (GitHub Pages stays up
as the asset source.)

## Local dev

```bash
npx wrangler dev
# http://127.0.0.1:8787/og?name=Anna
```
