import { fetchFragment } from './asyncFetch.js';
import { initHeaderSweep, splitStringIntoSpans } from './header.js';
import { initHref } from '../router.js';

type NavMenuProps = {
  navSelector: string;
  navHtml: string;
  bodyElement?: HTMLElement;
  containerSelector?: string;
}

/* ────────── Load navbar and menu events ────────── */

export async function initNavMenu({navSelector, navHtml, bodyElement, containerSelector}: NavMenuProps) {
  const navMenu = document.querySelector(navSelector);
  if (navMenu === null) return;

  const neverAbortSignal = () => new AbortController().signal; // always fully load navbar
  const data = await fetchFragment({path: `${navHtml}.html`, signal: neverAbortSignal()});

  if (data === null) return;

  navMenu.innerHTML = data;
  const navItems = navMenu.querySelectorAll('a');
  initHeaderSweep();
  navItems.forEach(link => {
    initHref({link, bodyElement: bodyElement, containerSelector, checkView: false}); // let loadView throw
  });

  const header: HTMLElement | null = document.querySelector("#header");
  if (header !== null) {
    header.removeAttribute('style');
  }
  const desktopLinks: NodeListOf<HTMLElement> = navMenu.querySelectorAll('.has-dropdown');
  desktopLinks.forEach(link => {
    splitStringIntoSpans({elSelector: 'a', spanClassName: 'navlink-char', parentEl: link});
  })
}

export async function ensureNavMenu({navSelector = '#nav-placeholder', navHtml = 'nav', bodyElement, containerSelector}: NavMenuProps) {
  const navPlaceholder = document.querySelector(navSelector);
  if (navPlaceholder && navPlaceholder.childElementCount === 0) {
    await initNavMenu({navSelector: '#nav-placeholder', navHtml, bodyElement, containerSelector});
  }
}
