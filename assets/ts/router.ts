import { initNavMenu } from './shared/nav.js';
import { getBaseCallbacks } from './baseCallbacks.js';
import { viewCallbacks } from './viewCallbacks.js';
// import { getViewCallbacks } from './viewCallbacks.js';
import { getContainer, toPageTitleCase } from './utils.js';
import { fetchFragment, scrollToTop } from './shared/misc.js';

import type { ViewCallbackKey, ViewKey } from './types.js';

/* ────────── SPA swapping logic ────────── */

var navInitiated = false;

export default function loadView(
  viewName: ViewKey,
  bodyEl: Element | null = document.querySelector("#body-placeholder"), // body element to replace with default
  containerSelector?: string, // string selector for container reference, defaults to window
  contentOnly: boolean = false // true if view is only to display content and is not a page navigation (e.g., skips history, footer buttons, and scrollToTop)
) {
  if (bodyEl === null) {  // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body element not found");})
    console.log("Body element not found!");
    return;
  }
  if (!navInitiated && viewName !== "home") { // load once after home page
      navInitiated = true;
      initNavMenu('#nav-placeholder', 'nav');
  }
    fetchFragment(`views/${viewName}.html`, (response) => {
      if (!response.ok) throw new Error(`View not found: ${viewName}`);
      return true;
    })
    .then((html) => {
      let title = document.querySelector("#title-placeholder");
      bodyEl.innerHTML = html;
      if (title !== null) {
        title.innerHTML = toPageTitleCase(viewName);
      }
      
      const checkNav: HTMLInputElement | null = document.querySelector("#checkNav");
      if (checkNav) {
        checkNav.checked = false;
        checkNav.dispatchEvent(new Event("change"));
      }
      const workDropdown: HTMLInputElement | null = document.querySelector("#workDropdown");
      if (workDropdown) {
        workDropdown.checked = false;
      }
      if (contentOnly === false){
        const base = import.meta.env.BASE_URL;
        history.pushState({ view: viewName }, "", `${base}${viewName}`);
      }

      const baseCallbacks = getBaseCallbacks(containerSelector, contentOnly);
      const viewSpecific = viewCallbacks[viewName as ViewCallbackKey] ?? [];
      const callbacks = [...baseCallbacks, ...viewSpecific];
      if (callbacks.length === 0) return;
      callbacks.forEach(cb => {
        try {
          cb(containerSelector);
        } catch (err) {
          console.error('Callback failed:', err);
        }
      });
    })
    .then(() => {
      const images = bodyEl.querySelectorAll("img");
      const imagePromises = Array.from(images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
        );
      return Promise.all(imagePromises);
    })
    .then(() => {
      if (contentOnly === false) {
        const container = getContainer(containerSelector);
        scrollToTop(container);
      }
    })
    .catch((error) => {
      // Fallback to home view or show error message
      console.error("Failed to load view:", error);
      if (viewName !== 'home') {
        loadView('home');
      } 
      // else {
      //   showFatalError(); // todo: show a "page not found" message?
      // }
    });
}