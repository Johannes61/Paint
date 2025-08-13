# Live Pixel Board — Fullscreen, Icons-Only Dock (GitHub Pages)

- **Fullscreen white grid**, fixed pixel size.
- **Icons-only side GUI** (pencil, eraser, color) — floating pill, centered on the side, rounded, offset from the edge with a subtle “chop”.
- **Live updates** with **GUN** (p2p). If a relay isn’t reachable, it **still works locally** so you can draw.
- Random color on refresh; change via the Color HUD.
- **No clear canvas** (erase with the eraser).

## Files
- `index.html`
- `style.css`
- `app.js`
- `README.md`

## Setup (GitHub Pages)
1. Add these files to a repo.
2. Enable Pages (Settings → Pages → Source: main).
3. Open the Pages URL in two tabs — draw in one tab and watch the other update live.

## Notes
- The grid always renders (no blank screen) — we build the DOM *before* realtime init and guard errors.
- Public GUN relays are best-effort. Add more peers in `app.js` or run your own relay for reliability.
- Tweak grid size in `app.js` (`COLS`, `ROWS`). Pixel size in `style.css` (`--pixel-size`).
