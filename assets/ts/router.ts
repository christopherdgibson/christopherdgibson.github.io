import { getBaseCallbacks } from './baseCallbacks.js';
import { viewCallbacks } from './viewCallbacks.js';
import { fetchFragment, scrollToTop } from './shared/misc.js';
import { ensureNavMenu } from './shared/nav.js';
import { isViewKey } from './types.js';
import { getContainer, normalizeViewPath, toPageTitleCase } from './utils.js';

import type { ViewCallbackKey, ViewKey } from './types.js';

type LoadViewProps = {
  view: ViewKey;
  bodyElement?: Element | null;
  containerSelector?: string;
  contentOnly?: boolean;
  updateHistory?: boolean;
}

/* ────────── SPA swapping logic ────────── */

export default async function loadView({
  view,
  bodyElement = document.querySelector("#body-placeholder"), // body element to replace with default
  containerSelector, // string selector for container reference, defaults to window
  contentOnly = false, // true if view is only to display content and is not a page navigation (e.g., skips history, footer buttons, and scrollToTop)
  updateHistory = true // false when called from popstate or initial load
}: LoadViewProps) {
  if (bodyElement === null) {  // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body element not found");})
    console.log("Body element not found!");
    return;
  }
  if (view !== "home" && !contentOnly) { // load once after home page
      ensureNavMenu({navSelector: '#nav-placeholder', navHtml: 'nav', bodyElement, containerSelector});
  }  
  try{
    if (!isViewKey(view)) throw new Error(`Invalid view name: ${view}`);

    const html = await fetchFragment(`views/${view}.html`, (response) => {
      if (!response.ok) throw new Error(`View not found: ${view}`);
      return true;
    });

    let title = document.querySelector("#title-placeholder");
    bodyElement.innerHTML = html;
    if (title !== null) {
      title.innerHTML = toPageTitleCase(view);
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
    if (contentOnly === false && updateHistory){
      const base = import.meta.env.BASE_URL;
      history.pushState({ view: view, containerSelector: containerSelector },
        "", `${base}${view}`);
    }

    const baseCallbacks = getBaseCallbacks(containerSelector, contentOnly);
    const viewSpecific = viewCallbacks[view as ViewCallbackKey] ?? [];
    const callbacks = [...baseCallbacks, ...viewSpecific];
    if (callbacks.length === 0) return;
    callbacks.forEach(cb => {
      try {
        cb(containerSelector);
      } catch (err) {
        console.error('Callback failed:', err);
      }
    });

    const images = bodyElement.querySelectorAll("img");
    const imagePromises = Array.from(images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          }),
      );
    await Promise.all(imagePromises);

    if (contentOnly === false) {
      const container = getContainer(containerSelector);
      scrollToTop(container);
    }

  } catch (error) {
    // Fallback to home view or show error message
    console.error("Failed to load view:", error);
    if (view !== 'home') {
      loadView({view: 'home', bodyElement, containerSelector});
    } 
    // else {
    //   showFatalError(); // todo: show a "page not found" message?
    // }
  }
}

/* ─── Navigation handling with History API and graceful fallback ─── */

export function initRouter() {
  // Listen for back/forward button
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.view) {
      const { view, containerSelector } = event.state;
      loadView({view, bodyElement: undefined, containerSelector, contentOnly: false, updateHistory: false});
    } else {
      // Load default/home view
      loadView({view: "home", bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false});
    }
  });

  // Handle refresh - check URL on page load
  window.addEventListener("DOMContentLoaded", () => {
    const base = import.meta.env.BASE_URL;

    // Check for 404 redirect first
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      const view = normalizeViewPath(redirect, base);
      history.replaceState({ view: view, containerSelector: undefined }, "", `${base}${view}`);
      loadView({view: view as ViewKey, bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false});
      return; // Exit early after handling the redirect
    }

    // Otherwise handle normal refresh/direct navigation
    const path = normalizeViewPath(window.location.pathname, base);

    if (path === 'wp-agenda-block') {
      history.replaceState({ view: 'wordpress-plugins' }, "", location.href);
      loadView({view: 'wordpress-plugins', bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false});
      return;
    }

    if (path && path !== "index.html") {
      history.replaceState({ view: path }, "", location.href);
      loadView({view: path as ViewKey, bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false}); // loadView validates cast internally
    } else {
      history.replaceState({ view: 'home' }, "", `${base}home`);
      loadView({view: 'home', bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false}); // default view
    }
  });
}
