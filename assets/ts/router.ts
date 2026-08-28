import { getBaseCallbacks } from './baseCallbacks.js';
import { viewCallbacks } from './viewCallbacks.js';
import { getAsyncCallbacks } from './asyncCallbacks.js';
import { fetchFragment } from './shared/asyncFetch.js';
import { scrollToTop } from './shared/misc.js';
import { ensureNavMenu } from './shared/nav.js';
import { isViewKey, getNavbarSection } from './types.js';
import { getContainer, normalizeViewPath, toPageTitleCase } from './utils.js';

import type { ViewCallbackKey, ViewKey } from './types.js';

interface LoadViewProps {
  view: ViewKey;
  bodyElement?: HTMLElement | null;
  containerSelector?: string;
  contentOnly?: boolean;
  updateHistory?: boolean;
  triggerAbort?: boolean;
}

interface InitHrefProps {
  link: HTMLAnchorElement;
  href?: string;
  bodyElement?: HTMLElement;
  containerSelector: string;
  checkView?: boolean;
}

interface SweepSpanLeftProps {
  nameChars: NodeListOf<HTMLElement>;
  charCount?: number;
  className?: string;
}

/* ────────── SPA swapping logic ────────── */

let currentController: AbortController | null = null;

export async function loadView({
  view,
  bodyElement = document.querySelector("#body-placeholder"), // body element to replace with default
  containerSelector, // string selector for container reference, defaults to window
  contentOnly = false, // true if view is only to display content and is not a page navigation (e.g., skips history, footer buttons, and scrollToTop)
  updateHistory = true, // false when called from popstate or initial load
  triggerAbort = !contentOnly // aborts pending fetches if true
}: LoadViewProps)
{
  // Re-use controller and do not abort for contentOnly load
  if (triggerAbort || currentController === null) {
    currentController?.abort();
    currentController = new AbortController();
  }

  const loadSignal = currentController.signal;

  if (bodyElement === null) {  // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body element not found");})
    console.log("Body element not found!");
    return;
  }
  if (view !== "home" && !contentOnly) { // load navbar once after home page
      await ensureNavMenu({navSelector: '#nav-placeholder', navHtml: 'nav', bodyElement, containerSelector});
  }  
  try{
    if (!isViewKey(view)) throw new Error(`Invalid view name: ${view}`);

    const html = await fetchFragment({
      path: `views/${view}.html`,
      signal: loadSignal,
      validate: (response) => {
        if (!response.ok) throw new Error(`View not found: ${view}`);
        return true;
      }
    });

    if (html === null) return;
    
    if (updateHistory && !contentOnly) {
      const container = getContainer(containerSelector);
      const scrollY = container === window ? window.scrollY : (container as HTMLElement).scrollTop;

      history.replaceState(
        { ...history.state, scroll: scrollY },
        "",
        location.href
      );
    }
    
    bodyElement.innerHTML = html;

    let title = document.querySelector("#title-placeholder");
    if (title !== null) {
      if (view === "home") {
        title.innerHTML = "Christopher Gibson - Home"
      } else {
        title.innerHTML = toPageTitleCase(view);
      }
    }
    
    const checkNav: HTMLInputElement | null = document.querySelector("#checkNav");
    if (checkNav) {
      checkNav.checked = false;
      checkNav.dispatchEvent(new Event("change"));
    }

    if (contentOnly === false && updateHistory){
      const base = import.meta.env.BASE_URL;
      history.pushState({ view, containerSelector },
        "", `${base}${view}`);
    }

    const baseCallbacks = getBaseCallbacks(containerSelector, contentOnly);
    const viewSpecific = viewCallbacks[view as ViewCallbackKey] ?? [];
    const asyncCallbacks = getAsyncCallbacks({bodyElement, containerSelector, loadSignal, contentOnly});
    const callbacks = [...baseCallbacks, ...viewSpecific, ...asyncCallbacks];
    if (callbacks.length === 0) return;

    for (const cb of callbacks) {
      if (loadSignal.aborted) return;
      try {
        await cb({bodyElement, containerSelector, loadSignal});
      } catch (err) {
        console.error('Callback failed:', err);
      }
    }

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

    if (loadSignal.aborted) return;

    if (contentOnly === false) {
      const container = getContainer(containerSelector);
      scrollToTop(container);
      setNavHighlight(view, '#nav-placeholder .has-dropdown a.desktop-link');
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

async function setNavHighlight(view: ViewKey, navlinkSelector: string) {
  const navLinks = document.querySelectorAll(navlinkSelector);
  const section = getNavbarSection(view);
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === section) {
      link.classList.add('active-section');
    } else {
      link.classList.remove('active-section');
    }
  });

  const rightChars: NodeListOf<HTMLElement> = document.querySelectorAll(`${navlinkSelector}:not(.active-section) .navlink-char.swept`);
  navlinkSweepRight(rightChars);

  const activeSection: HTMLElement | null =  document.querySelector(`${navlinkSelector}.active-section`);
  if (activeSection === null) return;

  const leftChars: NodeListOf<HTMLElement> = activeSection.querySelectorAll('.navlink-char');
  const transitionDuration = 300;
  navlinkSweepLeft({nameChars: leftChars}).then(() => {
    // Clear class to enable hover behaviour
    setTimeout(() => {
      activeSection.addEventListener('mouseenter', () => {
        activeSection.classList.remove('active-section');
      }, {once: true});
    }, transitionDuration);
  });
}

async function navlinkSweepLeft({nameChars, charCount = nameChars.length, className = 'swept'}: SweepSpanLeftProps) {
  await Promise.all(Array.from(nameChars).map((char, i) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        char.classList.add(className);
        resolve();
      }, (charCount - 1 - i) * 40);
    });
  }));
}

function navlinkSweepRight(nameChars: NodeListOf<HTMLElement>, className: string = 'swept') {
  nameChars.forEach((char, i) => {
    setTimeout(() => {
      char.classList.remove(className);
    }, i * 40);
  });
}

/* ─── Navigation handling with History API and graceful fallback ─── */

export function initRouter(): Promise<void> {
  // Override native browser restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Listen for back/forward button
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.view) {
      const { view, containerSelector, scroll } = event.state;
      loadView({view, bodyElement: undefined, containerSelector, contentOnly: false, updateHistory: false})
      .then(() => {
        const container = getContainer(containerSelector);
        const target = scroll ?? 0;
        if (container === window) {
          window.scrollTo(0, target);
        } else {
          container.scrollTo(0, target);
        }
      });
    } else {
      // Load default/home view
      loadView({view: "home", bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false});
    }
  });

  // Handle refresh - check URL on page load
  return new Promise<void>((resolve) => {
    const handleInitialLoad = () => {
      const base = import.meta.env.BASE_URL;
      let initialLoad: Promise<unknown>;

      // Check for 404 redirect first
      const redirect = sessionStorage.getItem("redirect");
      if (redirect) {
        sessionStorage.removeItem("redirect");
        const view = normalizeViewPath(redirect, base);
        history.replaceState({ view, containerSelector: undefined }, "", `${base}${view}`);
        initialLoad = loadView({view: view as ViewKey, bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false});
      } else {
        // Otherwise handle normal refresh/direct navigation
        const path = normalizeViewPath(window.location.pathname, base);
        if (path && path !== "index.html") {
          history.replaceState({ view: path }, "", `${base}${path}`);
          initialLoad = loadView({view: path as ViewKey, bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false}); // loadView validates cast internally
        } else {
          history.replaceState({ view: 'home' }, "", `${base}home`);
          initialLoad = loadView({view: 'home', bodyElement: undefined, containerSelector: undefined, contentOnly: false, updateHistory: false}); // default view
        }
      }

      // Resolve even if load fails
      initialLoad.then(() => resolve(), () => resolve());
    };

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", handleInitialLoad, { once: true });
    } else {
      // Handle directly in case DOMContentLoaded already fired
      handleInitialLoad();
    }
  });
}

export function initHref({link, href = link.getAttribute('href'), bodyElement, containerSelector, checkView = true}: InitHrefProps): boolean {
  if (checkView === true && !isViewKey(href)) {
    return false;
  }
  link.addEventListener("click", function (event) {
    event.preventDefault();
    loadView({view: href as ViewKey, bodyElement, containerSelector});
  });
  return true;
}
