import { initCurtainPreview } from '../components/curtain-preview.js';
import { initMobilePreview } from '../components/mobile-preview.js';
import { initCarousel } from '../shared/carousel.js';
import { initMockHeaderAsync } from '../shared/header.js';
import { initCardOverlay } from '../shared/overlays.js';
import type { CallbackProps, ViewCallback } from '../types.js';
import { initMiniSiteOverlay } from '../components/mini-site.js';

export default [
    ({containerSelector, loadSignal}: CallbackProps) => initMockHeaderAsync({
      containerSelector,
      sweepTextSelector: "#carouselWrapper .mockup-site-name span",
      sweepEventSelector: "#carouselWrapper",
      activeTab: "Home",
      activeClass: "activeCarousel",
      loadSignal,
      callback: () => {
        initCarousel();
      }
    }),
    ({containerSelector, loadSignal}: CallbackProps) => initMockHeaderAsync({containerSelector, mockHeaderSelector: '.curtain-demo-menu.menu-base', activeTab: "About", loadSignal}),
    ({containerSelector, loadSignal}: CallbackProps) => initMobilePreview({containerSelector, loadSignal}),
    () => initCardOverlay("#screenshotOverlay", "hamburgerCard"),
    () => initHamburgerAnimation(),
    ({loadSignal}: CallbackProps) => initMiniSiteOverlay(loadSignal),
    () => initCurtainPreview()
] satisfies ViewCallback[];

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
