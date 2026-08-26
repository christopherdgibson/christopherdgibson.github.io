import { fetchFragment, fetchIndexSvgIcons } from '../shared/asyncFetch.js';
import { initHeaderLink } from '../shared/header.js';
import { initScrollToTop } from '../shared/misc.js';
import { initNavMenu } from '../shared/nav.js';
import { closeOverlays, hideStartupOverlay, initCardOverlay } from '../shared/overlays.js';
import { loadView } from '../router.js';
import { removeClasses } from '../utils.js';

export async function initMiniSiteOverlay(loadSignal: AbortSignal) {
  let overlay = document.querySelector(".mini-site-overlay"); // do not need to initiate clean since closing refreshes index.html
  let btnLiveMiniSite: HTMLElement | null = document.querySelector("#btnMiniSite");
  let miniSite: HTMLElement | null = document.querySelector(".mini-site");

  if (!btnLiveMiniSite) return;

  if (!overlay || !btnLiveMiniSite || !miniSite) {
    btnLiveMiniSite.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
    return;
  }

  // Prevent further mini-site nesting
  if (document.querySelector(".mini-site.expanded-mini-site")) {
    initCardOverlay("#screenshotOverlay", "miniSiteLimitCard", "btnMiniSite");
    return;
  }

  btnLiveMiniSite.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    closeOverlays([".card-overlay", ".screenshot-overlay"].join(",")); // in case other overlays are open
    removeClasses(['expanded', 'view-nav']); // in case other cards are expanded
    document.querySelectorAll('[id]').forEach(el => {
        if (el.id !== "title-placeholder") { // keep title for setting later
            el.removeAttribute('id');
        }
    });
    const headerOuter = document.querySelector("header");
    if (headerOuter) {
      headerOuter.style.display = "none";
    }
    miniSite.classList.add("expanded-mini-site");
    overlay.classList.add("active-mini-site");

    fetchFragment({
      path: 'index.html',
      signal: loadSignal,
      validate: (response) => {
        if (!response.ok) throw new Error(`View not found: index`);
        return true;
      }
    })
    .then(data => {
      if (data === null) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      miniSite.innerHTML = doc.body.innerHTML;
      // if (bodyMini && !document.querySelector('#nav-placeholder')) {
      //   window.location.href = "index.html";
      //   loadView('personal-site-page.html');
      //   return;
      // }
      fetchIndexSvgIcons();
    }).then(() => {
      let bodyMini: HTMLElement | null = document.querySelector('#body-placeholder');
      initNavMenu({navSelector: '#nav-placeholder', navHtml: 'nav', bodyElement: bodyMini, containerSelector: '.mini-site.expanded-mini-site'});
      loadView({view: "personal-site-page", bodyElement: bodyMini, containerSelector: '.mini-site.expanded-mini-site'});
    })
    .then(() => {
      initScrollToTop(miniSite);
      initHeaderLink();

      const header: HTMLElement | null = document.querySelector('#header');
      const btn: HTMLElement | null = document.querySelector('#btnMiniSiteCard');

      if (header && btn) {
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            btn.style.top = `calc(${target.offsetHeight}px + 8px)`;
          }
        });
        resizeObserver.observe(header);
      }

      overlay.addEventListener("click", function () {
        sessionStorage.setItem("redirect", "personal-site-page");
        window.location.href = "/";
      });
    })
    .then(() => {
        const startupOverlay = document.getElementById('startupOverlay')
        hideStartupOverlay(true, startupOverlay);
    });
  });
}
