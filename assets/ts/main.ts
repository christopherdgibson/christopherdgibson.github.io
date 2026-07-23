import loadView from './router.js';

import { initHeaderLink, initScrollToTop } from './shared/misc.js';
import { fetchSvgIcon } from './utils.js';

import type { ViewKey } from './types.js';

// Global variables in index.html for single query and reuse
// let footer = document.querySelector("#footer-placeholder");

/* ────────── Initialise on start-up ────────── */

function fetchIndexSvgIcons() {
  const linkedInIcon: HTMLElement | null = document.querySelector(".footer-social");
  fetchSvgIcon(linkedInIcon, "/assets/svgs/linkedin.svg");
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
  // Check for 404 redirect first
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    const view = redirect.replace("/", "");
    loadView(view as ViewKey);
    return; // Exit early after handling the redirect
  }

  // Otherwise handle normal refresh/direct navigation
  const path = window.location.pathname.replace("/", "");
  if (path === 'wp-agenda-block') {
    loadView('wordpress-plugins');
    return;
  }
  if (path && path !== "index.html") {
    loadView(path as ViewKey);
  } else {
    // navInitiated = false;
    loadView("home"); // default view
  }
});