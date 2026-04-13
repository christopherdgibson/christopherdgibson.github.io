# christopherdgibson.github.io

Personal portfolio and project showcase, built as a single-page application and deployed via GitHub Pages.

🌐 **[christopherdgibson.github.io](https://christopherdgibson.github.io)**

---

## Overview

A single-page portfolio site with dynamically loaded views and a shared navigation layer. Projects are presented with links appropriate to their nature — live URLs, downloadable executables, and hosted demos.

The site runs entirely from one HTML file, with views loaded dynamically into a container. This architecture allows the site to be instantiated within itself as a live demo, with no iframes or screenshots.

---

## Projects

| Project | Type | Link |
|---|---|---|
| NYC 311 Dashboard      | Web app (Blazor/.NET)        | Live URL       |
| Report Download Hub | Desktop app (Avalonia/.NET) | Executable download |
| WordPress Plugins      | CMS plugins (WordPress/PHP)  | WordPress demo |
| | | |

---

## Tech Stack

- **HTML / CSS / JavaScript** — vanilla, no frameworks
- **CSS nesting** — native browser feature, no preprocessor required
- **Vite** — local development server and build tooling
- **GitHub Pages** — static site deployment

---

## Project Structure

```
christopherdgibson.github.io/
  index.html          # single HTML file, all views loaded dynamically
  style.css           # global styles and CSS variables
  script.js           # view routing and shared interaction logic
  assets/
    downloads/        # distributable executables
    images/           # site images
    pdfs/             # document assets
  drafts/             # local only, not tracked
```

---

## Local Development

Requires [Node.js](https://nodejs.org/).

```bash
# install dependencies
npm install

# start local dev server
npx vite
```

The site will be available at `http://localhost:5173`.

---

## Deployment

Deployed automatically to GitHub Pages from the `main` branch. The reserved GitHub Pages domain `christopherdgibson.github.io` serves the site at the base URL with no subdirectory.

---

## Notes

- The publish output directories (`dist/`, `.vite/`, `node_modules/`) are excluded from source control via `.gitignore`
- The `assets/downloads/` directory contains self-contained executables — no installation required on the target machine
