# Live Pixel Board (GitHub Pages + No Backend)

A **64×64** collaborative pixel board that **live-updates for everyone**.  
- Works on **GitHub Pages** (static hosting only).
- Uses **GUN** (peer-to-peer realtime) via public relays — no server required.
- Clean **white** theme.
- **Pencil**, **Eraser**, and **Color HUD** tools.
- **Your color randomizes on every refresh** (you can change it via the HUD).

## Demo Setup (GitHub Pages)

1. **Create a new repository** and add:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md`
2. Commit & push.
3. In the repo: **Settings → Pages →** set Source to `main` (or your default) and root (`/`).
4. Visit your GitHub Pages URL. Open it in two tabs or share it — drawings sync live.

## How it works
- The board is a 64×64 grid. Each pixel is stored by key `"x,y"` in GUN.
- When you draw, your browser updates that pixel’s color in the **p2p graph**.
- Everyone connected to the public relays receives the update in real time.

## Notes / Tips
- **No "Clear Canvas"** (by request). Erase using the **Eraser**.
- Public community relays are **best-effort**. For higher reliability, you can add more peers in `app.js` or host a tiny GUN relay (still simple).
- You can change grid size or pixel size by editing:
  - `GRID_SIZE` and `PIXEL_SIZE` in `app.js`
  - `--grid-size` and `--pixel-size` in `style.css`

## Customize
- Change the default random color logic in `app.js` (`randomColor()`).
- Tweak spacing, borders, or font in `style.css`.
- Add a mini‑map, hover color preview, or pixel coordinate tooltip.

## License
MIT
