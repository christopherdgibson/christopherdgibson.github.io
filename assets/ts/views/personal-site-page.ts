import { addBtnListener, initNavMenu } from '../shared/nav.js';
import { initCarousel } from '../shared/carousel.js';
import { initHoverSweep } from '../shared/headerSweep.js';
import { initHeaderLink, initScrollToTop } from '../shared/misc.js';
import { closeOverlays, initCardOverlay } from '../shared/overlays.js';
import loadView from '../router.js';
import { removeClasses } from '../utils.js';

export default [
    () => initCarousel(),
    () => initHoverSweep("#carouselWrapper .mockup-site-name span", "#carouselWrapper"),
    () => initCardOverlay("#screenshotOverlay", "hamburgerCard"),
    () => initHamburgerAnimation(),
    () => initMiniSiteOverlay(),
    (containerSelector?: string) => addBtnListener("#btnHomeCarousel", "home", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnExperienceCarousel", "experience", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnWorkCarousel", "work", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnResearchCarousel", "research", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnTeachingCarousel", "teaching", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnAboutCarousel", "about", containerSelector)
];

function initMiniSiteOverlay() {
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

    fetch('index.html')
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        miniSite.innerHTML = doc.body.innerHTML;
      })
      .then(() => {
        let bodyMini = document.querySelector('#body-placeholder');
        // if (bodyMini && !document.querySelector('#nav-placeholder')) {
        //   window.location.href = "index.html";
        //   loadView('personal-site-page.html');
        //   return;
        // }
        initNavMenu('#nav-placeholder', 'nav.html', bodyMini, '.mini-site.expanded-mini-site');
        loadView("personal-site-page", bodyMini, '.mini-site.expanded-mini-site');
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
      });
  });
}

function initHamburgerAnimation() {
  const hamburger: HTMLElement | null = document.querySelector(".hamburger-btn");
  const hamburgerClick: HTMLElement | null = document.querySelector('.hamburger-click');

  
  if (!hamburger || !hamburgerClick) return;
  const components = ["bottombun", "filling", "topbun", "condiments", "a-toothpick-or-something"];
  const divText = ["That's interesting, it's looking more like a hamburger already! If you meant to close the overlay, please click outside of this card.",
    "Are you expecting this to look even more like a hamburger? As explained above, it's just an icon.",
    "Okay it has a bun so the hamburger looks complete. Feel free to click outside of the card to close the overlay; probably nothing more to see here.",
    "If you're waiting for a toothpick or something you're probably expecting too much. Feel free to click outside of the card to close the overlay.",
    "Thanks for your persistence. I hope you enjoy your hamburger!"
  ];
  let cycles = 0;
  let current = 0;
  const total = components.length;
  const limit=7;

  function addClickEvent(index: number, hamburger: HTMLElement, hamburgerClick: HTMLElement) {
    current = (index + total + 1) % (total + 1);
    if (current == 0) {
      cycles++;
      hamburger.classList = "hamburger-btn";
      if (cycles >= 2 && cycles <= 10 || cycles == limit) {
        let text;
        if (cycles != limit) {
          if (cycles == 2) { text = "Did you notice that if you double-click the area quickly enough a highlighted hamburger pops up?"}
          else if (cycles == 10) { text = "I may start with quotes of the day at this point..."}
          else { text = cycles % 2 == 1 ? "Aren't you full by now?" : "You've been at this for a while now.";}
          hamburgerClick.innerHTML = text;
        } else {
          hamburgerClick.innerHTML = `At this point I would invite you to look into the code to read all the messages. Or keep clicking. If you are this thorough I\'m sure we would get along so feel free contact me by <a id="hamburgerEmail" href="mailto:cdg2131@columbia.edu">email!</a> This message intentionally broke the card height so you could see one more new thing. Was it worth doing this ${limit} times?`;
          document.querySelector("#hamburgerEmail")?.addEventListener("click", function(e) {
            e.stopPropagation();
          });
        }
      } else {
        hamburgerClick.innerHTML = "";
      }
      return;
    }
    hamburger.classList.add(components[current - 1]);
    if (!divText[current-1]) return;
    hamburgerClick.innerHTML = divText[current - 1];
  }

  document.querySelector('.modal-card')?.addEventListener("click", () => {
    addClickEvent(current + 1, hamburger, hamburgerClick);
  });
}