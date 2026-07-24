import loadView from './router.js';
import { isViewKey } from './types.js';

import { initHeaderLink, initScrollToTop } from './shared/misc.js';
import { fetchSvgIcon } from './utils.js';

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
    loadView(event.state.view);
  } else {
    // Load default/home view
    loadView("home");
  }
});

// Handle refresh - check URL on page load
window.addEventListener("DOMContentLoaded", () => {
  const base = import.meta.env.BASE_URL;

  // Check for 404 redirect first
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    let view = redirect;
    if (view.startsWith(base)) {
      view = view.slice(base.length);
    }
    view = view.replace(/^\//, "");
    loadView(view as ViewKey);
    return; // Exit early after handling the redirect
  }

  // Otherwise handle normal refresh/direct navigation
  let path = window.location.pathname;
  if (path.startsWith(base)) {
    path = path.slice(base.length);
  }
  path = path.replace(/^\//, "");

  if (path === 'wp-agenda-block') {
    loadView('wordpress-plugins');
    return;
  }

  if (path && path !== "index.html") {
    loadView(path as ViewKey); // loadView validates cast internally
  } else {
    // navInitiated = false;
    loadView("home"); // default view
  }
});