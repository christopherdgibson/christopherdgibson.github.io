import { fetchIndexSvgIcons } from './shared/asyncFetch.js';
import { initHeaderLink } from './shared/header.js';
import { initScrollToTop } from './shared/misc.js';
import { initRouter } from './router.js';

// Global variables in index.html for single query and reuse
// let footer = document.querySelector("#footer-placeholder");

/* ────────── Initialise on start-up ────────── */

fetchIndexSvgIcons();

/* ─── Index-page listeners ─── */

initScrollToTop();
initHeaderLink();
initRouter();
