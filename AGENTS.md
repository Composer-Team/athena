# Repository Guidelines

## Project Structure & Module Organization
- `docs/`: Main docs in Markdown/MDX. Order with `sidebar_position` in front matter. Subfolders include `tutorial-extras/` and `docs-submodules/`.
- `blog/`: Dated posts plus `authors.yml` and `tags.yml`.
- `src/`: `pages/` (MDX/React routes), `components/` (reusable MDX/React), `css/`.
- `static/`: Files served at site root; images in `static/img/` and referenced as `/img/...`.
- Top-level: `docusaurus.config.js` (site config), `sidebars.js` (navigation), `package.json` (scripts). Requires Node `>=18`.

## Build, Test, and Development Commands
- `npm ci`: Install dependencies (uses `package-lock.json`).
- `npm run start`: Local dev server with hot reload.
- `npm run build`: Production build to `build/`.
- `npm run serve`: Serve the built site locally for verification.
- `npm run clear`: Clear Docusaurus cache/artifacts.
- `npm run deploy`: Deploy per `docusaurus.config.js` (if configured).

## Coding Style & Naming Conventions
- Use Markdown/MDX with 2‑space indentation; filenames in kebab‑case (e.g., `getting-started.md`).
- Titles: sentence case via front matter `title:`; order via `sidebar_position:`.
- Images: place in `static/img/` and reference as `/img/<name>.<ext>`.
- MDX: keep components small; share in `src/components/` and import where needed.

Example front matter:
```md
---
title: Getting started
sidebar_position: 1
---
```

## Testing Guidelines
- No unit tests; verify docs by building locally.
- Before PR: run `npm run build` then `npm run serve`. Check for broken links, images, and console errors.
- Keep formatting consistent. If Prettier is available in your editor, use its defaults.

## Commit & Pull Request Guidelines
- History is minimal; prefer Conventional Commits going forward: `docs:`, `feat:`, `fix:`, `chore:`.
- Example: `docs: add TFHE introduction page`.
- PRs: concise description, linked issues, screenshots/GIFs for visual changes, and focused diffs.

## Security & Configuration Tips
- Do not commit secrets or private URLs; this is a static site.
- Optimize large assets (use compressed images) and store under `static/img/`.
- For custom sidebar order beyond `sidebar_position`, edit `sidebars.js`.
