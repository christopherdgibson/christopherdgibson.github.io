import { fetchIndexSvgIcons, initHeaderLink, initScrollToTop } from './shared/misc.js';
import { initRouter } from './router.js';

// Global variables in index.html for single query and reuse
// let footer = document.querySelector("#footer-placeholder");

/* ────────── Initialise on start-up ────────── */

fetchIndexSvgIcons();

/* ─── Index-page listeners ─── */

initScrollToTop();
initHeaderLink();
initRouter();
