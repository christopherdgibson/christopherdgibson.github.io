import { initHeaderSweep } from './header.js';
import { fetchFragment } from './misc.js';
import { loadView } from '../router.js';

import type { ViewKey } from '../types.js';

type NavMenuProps = {
  navSelector: string;
  navHtml: string;
  bodyElement?: Element | null;
  containerSelector?: string;
}

interface BtnClickProps {
  selector: string;
  view: ViewKey;
  containerSelector?: string;
}

interface NavClickProps extends BtnClickProps {
  bodyElement: Element | null;
}

/* ────────── Load navbar and menu events ────────── */

export function initNavMenu({navSelector, navHtml, bodyElement = document.querySelector("#body-placeholder"), containerSelector}: NavMenuProps) {
  const navMenu = document.querySelector(navSelector);
  if (navMenu === null) return;
  fetchFragment(`${navHtml}.html`)
    .then((data) => {
      navMenu.innerHTML = data;
      const navItems = navMenu.querySelectorAll('a');
      initHeaderSweep();
      navItems.forEach(btn => {
        btn.addEventListener("click", function(event) {
          event.preventDefault();
          loadView({view: btn.dataset.target as ViewKey, bodyElement, containerSelector});
        });
      });
    })
    .then(() => {
      const body: HTMLElement | null = document.querySelector("body");
      const header: HTMLElement | null = document.querySelector("#header");
      if (header !== null) {
        header.removeAttribute('style');
      }
      if (body !== null) {
        body.removeAttribute('style');
      }
    });
}

export function ensureNavMenu({navSelector = '#nav-placeholder', navHtml = 'nav', bodyElement, containerSelector}: NavMenuProps) {
  const navPlaceholder = document.querySelector(navSelector);
  if (navPlaceholder && navPlaceholder.childElementCount === 0) {
    initNavMenu({navSelector: '#nav-placeholder', navHtml, bodyElement, containerSelector});
  }
}

export function addBtnListener({selector, view, containerSelector}: BtnClickProps) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener("click", function (event) {
    event.preventDefault();
    loadView({view, bodyElement: undefined, containerSelector});
  });
}
