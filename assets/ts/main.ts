import loadView from './router.js';

import { initHeaderLink, initScrollToTop } from './shared/misc.js';
import { fetchSvgIcon, normalizeViewPath } from './utils.js';

import type { ViewKey } from './types.js';

// Global variables in index.html for single query and reuse
// let footer = document.querySelector("#footer-placeholder");

/* ────────── Initialise on start-up ────────── */

function fetchIndexSvgIcons() {
  const linkedInIcon: HTMLElement | null = document.querySelector(".footer-social");
  fetchSvgIcon(linkedInIcon, "linkedin");
}

/* ─── Index-page listeners ─── */

initScrollToTop();
initHeaderLink();
fetchIndexSvgIcons();


/* ─── Navigation handling with History API and graceful fallback ─── */

// Listen for back/forward button
window.addEventListener("popstate", (event) => {
  if (event.state && event.state.view) {
    loadView(event.state.view, undefined, undefined, false, false);
  } else {
    // Load default/home view
    loadView("home", undefined, undefined, false, false);
  }
});

// Handle refresh - check URL on page load
window.addEventListener("DOMContentLoaded", () => {
  const base = import.meta.env.BASE_URL;

  // Check for 404 redirect first
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    let view = normalizeViewPath(redirect, base);

    loadView(view as ViewKey);
    return; // Exit early after handling the redirect
  }

  // Otherwise handle normal refresh/direct navigation
  const path = normalizeViewPath(window.location.pathname, base);

  if (path === 'wp-agenda-block') {
    loadView('wordpress-plugins');
    return;
  }

  if (path && path !== "index.html") {
    loadView(path as ViewKey, undefined, undefined, false, false); // loadView validates cast internally
  } else {
    // navInitiated = false;
    loadView("home", undefined, undefined, false, false); // default view
  }
});
