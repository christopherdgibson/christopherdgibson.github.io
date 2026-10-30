import { fetchFragment } from './asyncFetch.js';
import { initHeaderSweep, splitStringIntoSpans } from './header.js';
import { PROJECT_CARD_DETAILS } from './projectCards.js';
import { initHref } from '../router.js';
import { VIEW_KEYS_WORK, type ProjectKey } from '../types';

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
  createProjectNavItems({containerSelector});

  const navItems = navMenu.querySelectorAll('a');
  initHeaderSweep();
  navItems.forEach(link => {
    initHref({link, bodyElement: bodyElement, containerSelector, checkView: false}); // let loadView throw
  });

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

export function createProjectNavItems({selector = '#workDropdown ul.dropdown', containerSelector}: {selector?: string, containerSelector?: string}) {
  const projectsSelector = `${containerSelector ?? ''} ${selector ?? ''}`;
  if (projectsSelector.trim() === '') return;

  const projects = document.querySelector(projectsSelector);
  if (projects === null) return;

  const projectsChildren = projects.children; // Keep existing non-project work links

  projects.replaceChildren(
    ...projectsChildren,
    ...VIEW_KEYS_WORK.map((key) => projectNavItem(key))
  );
}

function projectNavItem(key: ProjectKey): HTMLElement {
  const card = PROJECT_CARD_DETAILS[key];
  const navItem = document.createElement('li');
  navItem.innerHTML = `<a href="${key}"><div class="page-title">${card.title}</div><div class="stack-label">${card.techStack}</div></a>`;

  return navItem;
}
