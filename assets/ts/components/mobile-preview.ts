import { fetchFragment } from '../shared/misc.js';
import { initCloseModalBtn, closeOverlays } from '../shared/overlays.js';
import { getContainer, removeClasses, toPascalCase } from '../utils.js';

type MobilePreviewProps = {
  containerSelector?: string;
  overlaySelector?: string;
  itemId?: string;
  btnId?: string;
}

type OpenPreviewProps = {
  modal: HTMLElement;
  overlay: HTMLElement;
  containerSelector?: string;
  previewSelector?: string
}

export function initMobilePreview({containerSelector, overlaySelector = ".mobile-preview-overlay", itemId = "mobilePreviewCard", btnId}: MobilePreviewProps) {
  btnId = btnId ?? `btn${toPascalCase(itemId)}`;
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const btn: HTMLElement | null = document.getElementById(btnId);

  if (!overlay || !btn) {
    return;
  }

  const modal = document.getElementById(itemId);
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    openPreview({modal, overlay, containerSelector});

  });

  overlay.addEventListener('click', function() {
    modal?.classList.remove('expanded');
    overlay.classList.remove('active');
  });
}

function openPreview ({modal, overlay, containerSelector, previewSelector = '#mobilePreviewCard'} : OpenPreviewProps) {
  const container = getContainer(containerSelector);
  const headerParent = container !== window ? container as HTMLElement : document;
  const preview: HTMLElement | null = headerParent.querySelector(previewSelector);

  if (preview === null) return;

  if (window.self !== window.top) {
    const limitModal: HTMLElement | null = document.querySelector('#miniSiteLimitCard');
    const limitOverlay: HTMLElement | null = document.querySelector('#screenshotOverlay');
    limitModal?.classList.add("expanded");
    limitOverlay?.classList.add("active");

    initCloseModalBtn(limitModal, limitOverlay);
    return;
  }

  closeOverlays([".card-overlay", ".screenshot-overlay"].join(",")); // in case other overlays are open;
  removeClasses(['expanded']); // in case other cards are expanded
  modal?.classList.add("expanded");
  overlay.classList.add("active");

  if (preview.dataset.iframeOpen === "true") return;

  fetchFragment({path: `components/mobile-preview.html`,
    validate: (response) => {
      if (!response.ok) throw new Error('Mobile preview not found');
      return true;
    }
  })
  .then((html) => {
    preview.innerHTML = html;
    preview.dataset.iframeOpen = "true";
  })
  .then(() =>{
    initCloseModalBtn(modal, overlay);
  })
  .catch((err) => console.error(err));
}