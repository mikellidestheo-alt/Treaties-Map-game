# Peace Treaties 3D · 1919–1923

An interactive 3D history game about the post-WW1 peace settlements. Rotate, zoom and tap a low-poly extruded
map of Europe, Africa, the Middle East and the Asia Pacific to locate lost territories, colonies and League of
Nations mandates, then read the textbook card that unlocks.

**Treaties covered:** Versailles (Germany) · Saint-Germain (Austria) · Neuilly (Bulgaria) · Trianon (Hungary) ·
Sèvres (Ottoman Empire) · plus a **Lausanne (1923) comparison mode** that morphs the Sèvres partition into the
Turkish settlement with a slider.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Controls

| | Mouse | Touch |
|---|---|---|
| Select territory | click (hover highlights) | tap |
| Pan | left-drag | one-finger drag |
| Zoom | scroll wheel | two-finger pinch |
| Tilt / rotate | right-drag | two-finger twist |

Camera shortcuts (Europe / Africa / Middle East / Asia Pacific / World) sit at the bottom. The camera is bounded
(distance, tilt, azimuth and pan limits) to keep the map in view.

## Project layout

```
index.html                 HUD markup (Tailwind classes)
vite.config.js             Vite + Tailwind; base path = /<repo-name>/ for GitHub Pages
src/main.js                bootstrap
src/style.css              Tailwind + component styles
src/audio.js               WebAudio sound effects (no assets)
src/data/geo.js            low-poly land, quiz-region polygons (lon/lat), camera presets
src/data/treaties.js       treaties, key terms, questions, textbook cards, Lausanne comparison data
src/engine/MapScene.js     three.js scene: extruded meshes, OrbitControls, raycast picking, animations
src/game/Game.js           quiz state machine, scoring, drawer/modals, comparison mode
.github/workflows/deploy.yml   GitHub Pages deployment
```

## Scoring

100 points per territory, −30 for each wrong guess, −20 for using the hint (minimum 10). Three wrong guesses
reveal the answer for 0 points.

## Deploying to GitHub Pages

1. In the repository go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` builds the site and publishes it with
   `actions/upload-pages-artifact` and `actions/deploy-pages`.
3. `vite.config.js` reads `GITHUB_REPOSITORY` so the build base path always matches the repository name
   (falls back to `/Treaties-Map-game/`).

## Notes on the geography

The map is hand-simplified for performance and clarity. Very small territories (Saar, Nauru, Samoa, the Pacific
island chains) are deliberately exaggerated so they are tappable, and tap-assist selects the nearest small
territory within a finger-sized radius.
