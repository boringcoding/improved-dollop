# ✦ AURA — your soul, visualized

Type your name. Watch a one-of-a-kind aura bloom — woven only from you.

**Live:** https://boringcoding.github.io/improved-dollop/

AURA is a tiny, zero-dependency web toy designed to be shared. Enter a name and it
deterministically generates a personal "aura":

- 🌀 a living, animated aura orb (HTML canvas, unique colors per name)
- 🏷️ an **aura name** (e.g. *Velvet Falcon*, *Solar Mirror*)
- 📊 your **energy blend** — Fire · Water · Air · Earth · Aether
- ✍️ a short, poetic **reading** made just for you
- 🔗 **shareable link** (`?name=...`) that re-opens the exact same aura
- 🖼️ **save image** — a beautiful card to post anywhere

It's the classic viral loop: *personal → beautiful → "what's yours?" → share.*

## Why it can spread

- **No sign-up, no backend, no data leaves the device** — pure static page.
- Every name maps to a **stable, unique** result, so links are sticky and reproducible.
- One-tap **native share** on mobile, **copy link** on desktop, and a **downloadable card**
  with rich Open Graph previews for socials.

## Tech

A single `index.html` — vanilla JS + Canvas 2D. Determinism comes from an FNV-1a hash of
the name seeding a `mulberry32` PRNG, so there are no servers and no randomness drift.

## Deploy

Pushing to the development branch triggers `.github/workflows/deploy.yml`, which publishes
the static site to GitHub Pages automatically.

---

Made with light. ✦
