import { getContainer, toPascalCase } from '../utils.js';
import { scrollToAnchor, scrollToTop  } from './misc.js';
import { loadView } from '../router.js';

import type { PreviewViewKey, ViewKey } from '../types.js';

interface PreviewSectionProps {
  section: PreviewViewKey;
  containerSelector?: string;
  loadSignal?: AbortSignal;
}

let previewsExpanded: number;

export async function initPreviewSection({section, containerSelector, loadSignal}: PreviewSectionProps) {
  const Section = toPascalCase(section);
  const sectionBtn: HTMLAnchorElement | null = document.querySelector(`#btn${Section}Home`);
  const hoverBridge: HTMLElement | null = document.querySelector('.hover-bridge');
  const peekWrapper: HTMLElement | null = document.querySelector(`.peek-wrapper.${section}`);
  const peekBtn: HTMLAnchorElement | null = document.querySelector(`#peekBtn${Section}`);
  const peekPanel: HTMLElement | null = document.querySelector(`#peek${Section}Home`);
  const peekMobile: HTMLElement | null = document.querySelector(`.btn-preview-${section}`);

  const defaultOrder: Record<PreviewViewKey, string>  = {work: '1', experience: '2'};

  const hoverDelay = 200; // grace period to avoid hover flickering

  let isPreviewLoaded = false;
  let closeTimer: number;
  let ariaTimer: number;
  previewsExpanded = 0;

  if (peekWrapper === null || peekPanel === null) return;

  function open(element: HTMLElement = peekWrapper) {
    clearTimeout(closeTimer);
    element?.classList.add('expanded-preview');
  }

  function scheduleClose(previewEls: HTMLElement[]) {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      previewEls.forEach((previewEl) => {
        previewEl?.classList.remove('expanded-preview');
      });
    }, hoverDelay);
  }

  function scheduleAria(previewEl: HTMLElement, ariaHovered: boolean) {
    clearTimeout(ariaTimer);
    ariaTimer = setTimeout(() => {
      previewEl.setAttribute('aria-hovered', ariaHovered.toString());
    }, hoverDelay);
  }

  sectionBtn?.addEventListener('mouseenter', (event) => {
    event.preventDefault();
    ensurePreviewLoaded();
  }, { once: true });

  sectionBtn?.addEventListener('mouseenter', () => {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    peekWrapper.style.order = '0';
    if (window.innerWidth > 550) {
      open(peekWrapper);
    } else {
      open(peekMobile);
    }
  });
  
  sectionBtn?.addEventListener('mouseleave', () => {
    if (window.innerWidth > 550) {
      scheduleClose([peekWrapper]);
    } else {
      scheduleClose([peekMobile, peekWrapper]); // peekWrapper necessary in case timer resets
    }
  });

  peekMobile.addEventListener('mouseenter', () => {
    if (peekMobile?.classList.contains('expanded-preview') || peekMobile.getAttribute('aria-hovered') === 'true') {
      scheduleAria(peekMobile, true);
      open(peekWrapper);
    }
  });
  peekMobile.addEventListener('mouseleave', () => {
    scheduleClose([peekWrapper, peekMobile]); // peekMobile necessary in case timer resets
    scheduleAria(peekMobile, false);
  });

  [peekWrapper, hoverBridge].forEach((el) => {
    el?.addEventListener('mouseenter', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        open(peekWrapper);
        open(peekMobile);
      }
    });
     el?.addEventListener('mouseleave', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        scheduleClose([peekWrapper, peekMobile]);
      }
    });
  });

  peekMobile.addEventListener("click", (event) => {
    event.preventDefault();

    ensurePreviewLoaded(isPreviewLoaded).then(() => {
      expandSectionPreview();
    })
  });

  peekBtn?.addEventListener("click", (event) => {
    event.preventDefault();

    ensurePreviewLoaded(isPreviewLoaded).then(() => {
      expandSectionPreview();
    })
  });

  async function ensurePreviewLoaded(isLoaded: boolean = false) {
    if (isLoaded === true) return;

    const previewSectionSelector = `#peek${Section}Home`;
    await loadView({view: section, bodyElement: peekPanel, containerSelector: previewSectionSelector, contentOnly: true})
    .then(() => {
      if (loadSignal.aborted) return;
      isPreviewLoaded = true;

      // Assign links to replace view, not preview window
      const links = peekPanel.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const href = link.getAttribute('href');
          loadView({view: href as ViewKey, bodyElement: undefined, containerSelector});
        });
      });
    });
  }

  function expandSectionPreview() {
    peekWrapper.style.order = defaultOrder[section];
    peekPanel.classList.toggle('expanded-preview');
    const isExpanded = peekPanel.classList.contains('expanded-preview');
    peekBtn.setAttribute('aria-expanded', isExpanded.toString());
    if (!isExpanded) {
      previewsExpanded --;
      scrollToTop(peekPanel); // reset to top when closed
      return;
    }

    const container = getContainer(containerSelector);
    const pageTagParent = container !== window ? container as HTMLElement : document;
    let heroActions: HTMLElement | null = pageTagParent.querySelector('.hero-actions');

    if (previewsExpanded === 0) { // scroll to hover buttons
      scrollToAnchor({target: heroActions, container, includeHeader: true});
    } else {
      scrollToAnchor({target: peekWrapper, container, includeHeader: true}); // scroll to preview when multiple open
    }
    previewsExpanded ++;
  }
}
