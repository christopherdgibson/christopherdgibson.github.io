import { getBaseCallbacks } from './baseCallbacks.js';
import { viewCallbacks } from './viewCallbacks.js';
import { fetchFragment, scrollToTop } from './shared/misc.js';
import { ensureNavMenu } from './shared/nav.js';
import { isViewKey } from './types.js';
import { getContainer, normalizeViewPath, toPageTitleCase } from './utils.js';

import type { ViewCallbackKey, ViewKey } from './types.js';

/* ────────── SPA swapping logic ────────── */

export default async function loadView(
  viewName: ViewKey,
  bodyEl: Element | null = document.querySelector("#body-placeholder"), // body element to replace with default
  containerSelector?: string, // string selector for container reference, defaults to window
  contentOnly: boolean = false, // true if view is only to display content and is not a page navigation (e.g., skips history, footer buttons, and scrollToTop)
  updateHistory: boolean = true // false when called from popstate or initial load
) {
  if (bodyEl === null) {  // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body element not found");})
    console.log("Body element not found!");
    return;
  }
  if (viewName !== "home" && !contentOnly) { // load once after home page
      ensureNavMenu('#nav-placeholder', 'nav', bodyEl, containerSelector);
  }
  try{
    if (!isViewKey(viewName)) throw new Error(`Invalid view name: ${viewName}`);

    const html = await fetchFragment(`views/${viewName}.html`, (response) => {
      if (!response.ok) throw new Error(`View not found: ${viewName}`);
      return true;
    });

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
    if (contentOnly === false && updateHistory){
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
    await Promise.all(imagePromises);

    if (contentOnly === false) {
      const container = getContainer(containerSelector);
      scrollToTop(container);
    }

  } catch (error) {
    // Fallback to home view or show error message
    console.error("Failed to load view:", error);
    if (viewName !== 'home') {
      loadView('home');
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
      loadView(event.state.view, undefined, undefined, false, false);
    } else {
      // Load default/home view
      loadView("home", undefined, undefined, false, false);
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
      history.replaceState({ view }, "", `${base}${view}`);
      loadView(view as ViewKey, undefined, undefined, false, false);
      return; // Exit early after handling the redirect
    }

    // Otherwise handle normal refresh/direct navigation
    const path = normalizeViewPath(window.location.pathname, base);

    if (path === 'wp-agenda-block') {
      history.replaceState({ view: 'wordpress-plugins' }, "", location.href);
      loadView('wordpress-plugins', undefined, undefined, false, false);
      return;
    }

    if (path && path !== "index.html") {
      history.replaceState({ view: path }, "", location.href);
      loadView(path as ViewKey, undefined, undefined, false, false); // loadView validates cast internally
    } else {
      history.replaceState({ view: 'home' }, "", `${base}home`);
      loadView('home', undefined, undefined, false, false); // default view
    }
  });
}
