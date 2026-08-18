import { fetchSvgIcon, scrollToAnchor } from './shared/misc.js';
import { initCardOverlay } from './shared/overlays.js';
import { initHref, loadView } from './router.js';
import { getCleanElement, getCleanElements, getContainer } from './utils.js';

import type { ViewCallback, ViewKey } from './types.js';

export function getBaseCallbacks(containerSelector?: string, contentOnly?: boolean) {
  return [
    () => initAnchorButtons(containerSelector),
    ...(contentOnly === false ? [
      () => initFooterButtons(containerSelector),
      () => initCleanOverlays([".card-overlay", ".screenshot-overlay"].join(",")),
      () => initCardOverlay("#screenshotOverlay", "miniSiteCard"),
    ] : []),
    () => initFeatureCards(),
    () => initScreenshots(),
  ] satisfies ViewCallback[];
}

let pulseIteration = 0;
function initAnchorButtons(containerSelector?: string, includeHeader: boolean = true, behavior: ScrollBehavior = "smooth") {
  const container = getContainer(containerSelector);
  const pageTagParent = container !== window ? container as HTMLElement : document;

  const pageTagBtns: NodeListOf<HTMLButtonElement> = pageTagParent.querySelectorAll(".page-tag-btn");
  if (pageTagBtns.length === 0) return;

  pageTagBtns.forEach((btn: HTMLElement) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target ?? '');
      if (!target) return;
      scrollToAnchor({target, container, includeHeader, behavior})
    });
  });

  if (pulseIteration < 3) { // limit pulse of badge to 3 times
    addPulses(pageTagBtns, 500, 200);
    pulseIteration++;
  }
}

function addPulses(elements: NodeListOf<HTMLButtonElement>, delay: number, stagger: number) {
  if (elements.length === 0) return;

  let timeout = delay;
  elements.forEach(el => {
    timeout += stagger;
    const addTime = timeout;
    setTimeout(() => {
      el.classList.add('pulse-once');
      setTimeout(() => el.classList.remove('pulse-once'), 300);
    }, addTime);
  });
}

export function initSvgIcons(iconSelector: string = ".svg-icon") {
  const icons: NodeListOf<HTMLElement> = document.querySelectorAll(iconSelector);
  if (!icons.length) return;
  icons.forEach((icon) => {
    if (!icon.dataset.target) return;
    fetchSvgIcon(icon, `${icon.dataset.target}`);
  });
}

function initFooterButtons(containerSelector?: string) {
  const bodyElement: HTMLElement | null = document.querySelector("#body-placeholder");
  const viewNav: HTMLElement | null = document.querySelector(".view-nav");
  let backLink: HTMLAnchorElement | null = getCleanElement('#footer-back-btn');
  let nextLink: HTMLAnchorElement | null = getCleanElement('#footer-next-btn');

  if (!viewNav) {
    backLink?.setAttribute('style', 'display: none');
    nextLink?.setAttribute('style', 'display: none');
    return;
  }

  if (backLink && viewNav.dataset.backText) {
    backLink.removeAttribute('class');
    const backTextEl = backLink.querySelector('.footer-text');
    backTextEl.innerHTML = viewNav.dataset.backText;
    backLink.classList.toggle('hide-desktop-text', viewNav.dataset.backView === 'home')
    backLink.setAttribute('href', viewNav.dataset.backView);
    backLink.addEventListener("click", function (event) {
      event.preventDefault();
      loadView({view: viewNav.dataset.backView as ViewKey, bodyElement, containerSelector});
    });
  } else if (backLink) {
    backLink.classList.toggle('hide-footer-link', true);
  }

  if (nextLink && viewNav.dataset.nextText) {
    nextLink.removeAttribute('class');
    const nextTextEl = nextLink.querySelector('.footer-text');
    nextTextEl.innerHTML = viewNav.dataset.nextText;
    if (viewNav.dataset.nextLink) {
      const isView = initHref({link: nextLink, href: viewNav.dataset.nextLink, bodyElement, containerSelector});
      const hideDesktopText = !isView || viewNav.dataset.nextLink === 'home';
      nextLink.setAttribute('href', viewNav.dataset.nextLink);
      nextLink.classList.toggle('hide-desktop-text', hideDesktopText);
    }
  } else if (nextLink) {
    nextLink.classList.toggle('hide-footer-link', true);
  }
}

// Clear overlay event listeners to prevent stacking on multiple view loads
function initCleanOverlays(overlaySelectors: string) {
  const overlays: HTMLElement[] | undefined = getCleanElements(overlaySelectors);
  if (!overlays || overlays.length === 0) return;
  overlays.forEach((overlay) => {
    overlay.addEventListener("click", function () {
      const expanded = document.querySelectorAll(".expanded, .hidden");
      if (expanded.length) {
        expanded.forEach((el) => {
          el.classList.remove("expanded");
          el.classList.remove("hidden");
        });
      }
      this.classList.remove("active");
    });
  });
}

function initFeatureCards() {
  initOverlay("#cardOverlay", ".feature-card");
}

function initOverlay(
  overlaySelector: string,
  itemSelector: string,
  minWidth: number = 768,
  proxySelector: string | null = null,
  expandedClass: string = "expanded",
  activeClass: string = "active") {
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const items: NodeListOf<HTMLElement> = document.querySelectorAll(itemSelector);

  if (!overlay || !items.length) {
    return;
  }

  let proxy: HTMLElement | null;
  if (proxySelector !== null) {
    proxy = document.querySelector(proxySelector);
    proxy?.addEventListener("click", function(e: Event) {
      e.preventDefault();
    })
  }

  items.forEach((item) => {
    const itemEvent = proxy ?? item;
    itemEvent.addEventListener("click", function () {
      if (window.innerWidth > minWidth) return;
      this.classList.add(`${expandedClass}`);
      overlay.classList.add(`${activeClass}`);
    });
  });
}

function initScreenshots() {
  const overlay: HTMLElement | null = document.querySelector("#screenshotOverlay");
  const wrappers: NodeListOf<HTMLElement> = document.querySelectorAll(".screenshot-wrapper");
  if (!overlay || !wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const img: HTMLImageElement | null = wrapper.querySelector(".hero-screenshot");
    let chevronLeft: HTMLButtonElement | null = document.querySelector(".chevron-left");
    let chevronRight: HTMLButtonElement | null = document.querySelector(".chevron-right");
    const images = JSON.parse(wrapper.dataset.images ?? '');
    let current = 0;

    // create chevrons dynamically if not found
    if (chevronLeft === null) {
      chevronLeft = document.createElement('button');
      chevronLeft.className = 'chevron chevron-left';
      chevronLeft.innerHTML = '&#8249;';
      wrapper.appendChild(chevronLeft);
    }

    if (chevronRight === null) {
      chevronRight = document.createElement('button');
      chevronRight.className = 'chevron chevron-right';
      chevronRight.innerHTML = '&#8250;';
      wrapper.appendChild(chevronRight);
    }

    if (images.length <= 1) {
      chevronLeft.style.visibility = "hidden";
      chevronRight.style.visibility = "hidden";
    } else {
      chevronLeft.addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(current - 1);
      });

      chevronRight.addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(current + 1);
      });
    }

    function showImage(index: number) {
      if (!img) return;
      current = (index + images.length) % images.length;
      img.src = images[current];
    }

    wrappers.forEach((wrapper) => {
      wrapper.addEventListener("click", function () {
        this.classList.add("expanded");
        overlay.classList.add("active");
      });
    });
  });
}
