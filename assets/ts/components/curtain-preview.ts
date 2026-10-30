import { PROJECT_CARD_DETAILS } from "../shared/projectCards";
import { VIEW_KEYS_WORK, type ProjectKey } from '../types.js';

export function initCurtainPreview(overlaySelector: string = '.curtain-preview-overlay') { //TODO: Should this include containerSelector?
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const btnCurtainPreview = document.querySelector('#btnCurtainPreviewCard');

  if (!overlay || !btnCurtainPreview) {
    return;
  }

  const mockup = overlay.querySelector('.curtain-demo-menu.menu-top .mockup-site-nav');
  if (mockup === null) return;

  const mockupChildren = mockup.children; // Keep existing non-project links

  mockup.replaceChildren(
    ...mockupChildren,
    ...VIEW_KEYS_WORK.map((key) => mockupProjectNavItem(key))
  );
  
  const submenu: HTMLElement | null = overlay.querySelector('.curtain-demo-submenu');

  ensureRays();
  btnCurtainPreview.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlay.classList.remove('active',  'cycle');
    void submenu?.offsetWidth; // reflow for re-trigger
    overlay.classList.add('active', 'cycle');
  });

  overlay.addEventListener('animationend', (e) => {
    if (e.animationName !== 'rayIn') return;
    overlay.classList.remove('active', 'cycle');
  });
}

function ensureRays(rays?: HTMLElement | null) {
    rays = rays ?? document.getElementById("rays");

    if (rays?.childElementCount === 0) {
      const n = 10; 
      for (let i = 0; i < n; i++) {
        const r = document.createElement("div");
        r.className = "ray";
        r.style.setProperty("--rot", i * (360 / n) + "deg");
        rays.appendChild(r);
      }
    }
}

function mockupProjectNavItem(key: ProjectKey): HTMLElement {
  const card = PROJECT_CARD_DETAILS[key];
  const navItem = document.createElement('div');
  navItem.classList.add("mockup-nav-item")
  if (key === 'personal-site-page') {
    navItem.classList.add("demo-navbar-active");
  }
  navItem.innerHTML = `<span>${card.title}</span>`;

  return navItem;
}
