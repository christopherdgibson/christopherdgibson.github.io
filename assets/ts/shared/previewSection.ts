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
  const btn: HTMLAnchorElement | null = document.querySelector(`#btn${Section}Home`);
  const hoverBridge: HTMLElement | null = document.querySelector('.hover-bridge');
  const peekWrapper: HTMLElement | null = document.querySelector(`.peek-wrapper.${section}`);
  const peekBtn: HTMLAnchorElement | null = document.querySelector(`#peekBtn${Section}`);
  const peekPanel: HTMLElement | null = document.querySelector(`#peek${Section}Home`);

  const defaultOrder: Record<PreviewViewKey, string >  = {work: '1', experience: '2'}

  let closeTimer: number;
  previewsExpanded = 0;

  function open() {
    clearTimeout(closeTimer);
    peekWrapper?.classList.add('expanded-preview');
  }

  function scheduleClose() {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      peekWrapper?.classList.remove('expanded-preview');
    }, 200); // grace period to avoid flickering
  }

  if (peekWrapper === null || peekPanel === null) return;
  btn?.addEventListener('mouseenter', () => {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    peekWrapper.style.order = '0';
    open();
  });
  btn?.addEventListener("mouseenter", (event) => {
    event.preventDefault();
    const previewSectionSelector = `#peek${Section}Home`;
    loadView({view: section, bodyElement: peekPanel, containerSelector: previewSectionSelector, contentOnly: true})
    .then(() => {
      if (loadSignal.aborted) return;

      const links = peekPanel.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const href = link.getAttribute('href');
          loadView({view: href as ViewKey, bodyElement: undefined, containerSelector});
        });
      });
    });
  }, { once: true });
  btn?.addEventListener('mouseleave', () => {
    scheduleClose();
  });

  [peekWrapper, hoverBridge].forEach((el) => {
    el?.addEventListener('mouseenter', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        open();
      }
    });
     el?.addEventListener('mouseleave', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        scheduleClose();
      }
    });
  });

  peekBtn?.addEventListener("click", (event) => {
    event.preventDefault();
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
  });
}
