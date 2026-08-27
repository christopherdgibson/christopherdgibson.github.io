import { fetchFragment } from './asyncFetch.js';
import { initHeaderSweep } from './header.js';
import { initHref } from '../router.js';

type NavMenuProps = {
  navSelector: string;
  navHtml: string;
  bodyElement?: HTMLElement | null;
  containerSelector?: string;
}

/* ────────── Load navbar and menu events ────────── */

export async function initNavMenu({navSelector, navHtml, bodyElement = document.querySelector("#body-placeholder"), containerSelector}: NavMenuProps) {
  const navMenu = document.querySelector(navSelector);
  if (navMenu === null) return;

  const neverAbortSignal = () => new AbortController().signal; // always fully load navbar
  const data = await fetchFragment({path: `${navHtml}.html`, signal: neverAbortSignal()});
  
  if (data === null) return;

  navMenu.innerHTML = data;
  const navItems = navMenu.querySelectorAll('a');
  initHeaderSweep();
  navItems.forEach(link => {
    initHref({link, bodyElement, containerSelector, checkView: false}); // let loadView throw
  });

  const header: HTMLElement | null = document.querySelector("#header");
  if (header !== null) {
    header.removeAttribute('style');
  }
}

export function ensureNavMenu({navSelector = '#nav-placeholder', navHtml = 'nav', bodyElement, containerSelector}: NavMenuProps) {
  const navPlaceholder = document.querySelector(navSelector);
  if (navPlaceholder && navPlaceholder.childElementCount === 0) {
    initNavMenu({navSelector: '#nav-placeholder', navHtml, bodyElement, containerSelector});
  }
}
