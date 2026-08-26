import { fetchIndexSvgIcons } from './shared/asyncFetch.js';
import { initHeaderLink } from './shared/header.js';
import { initScrollToTop } from './shared/misc.js';
import { hideStartupOverlay } from './shared/overlays.js';
import { initRouter } from './router.js';

// Global variables in index.html for single query and reuse
// let footer = document.querySelector("#footer-placeholder");

/* ────────── Initialise on start-up ────────── */

async function bootstrap() {
    await Promise.all([
        fetchIndexSvgIcons(),
        initScrollToTop(),
        initHeaderLink(),
        initRouter()
    ]);

    hideStartupOverlay(true);
}

bootstrap();

/* ────────── Remove overlay failsafe ────────── */

window.addEventListener('load', () => {
    setTimeout(() => {
        hideStartupOverlay(true);
    }, 3000);
}, {once: true});
