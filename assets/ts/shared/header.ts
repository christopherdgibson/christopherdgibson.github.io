import { fetchFragment } from './misc.js';
import { loadView } from '../router.js';
import { getContainer } from '../utils.js';

interface MockHeaderProps {
  containerSelector?: string;
  mockHeaderSelector?: string;
  sweepTextSelector?: string;
  sweepEventSelector?: string;
  activeTab: string;
  activeClass?: string;
  isLoadCurrent: () => boolean;
  callback?: () => void;
}

export function initHeaderLink() {
  const headerLink = document.querySelector("#headerLink");
  if (!headerLink) return;
  headerLink.addEventListener("click", function (event) {
    event.preventDefault();
    loadView({view: "work"});
  });
}

export async function initMockHeaderAsync({containerSelector, mockHeaderSelector = '.mockup-site-header', sweepTextSelector, sweepEventSelector, activeTab, activeClass = 'active', callback, isLoadCurrent}: MockHeaderProps) {
  const container = getContainer(containerSelector);
  const headerParent = container !== window ? container as HTMLElement : document;
  const mockHeader = headerParent.querySelector(mockHeaderSelector);

  if (mockHeader === null) return;
  await fetchFragment(`components/mockup-header.html`, (response) => {
    if (!response.ok) throw new Error('Mockup header not found');
    return true;
  })
  .then((html) => {
    if (!isLoadCurrent()) return;
    mockHeader.innerHTML = html;

    const mockupNavItems = mockHeader.querySelectorAll('.mockup-nav-item');
    mockupNavItems.forEach(item => {
      item.classList.toggle(activeClass, item.innerHTML.includes(activeTab));
    })

    if (callback) {
      callback();
    }

    if (sweepTextSelector && sweepEventSelector) {
      initHoverSweep(sweepTextSelector, sweepEventSelector);
    }
  })
  .catch((err) => console.error(err));
}

export function initHeaderSweep(textSelector: string = "#headerLink span", eventSelector: string = "#checkNav", event: any = "change") {
  splitStringIntoSpans(textSelector);

  const eventEl: HTMLInputElement | null = document.querySelector(eventSelector);
  if (eventEl === null) return;
  eventEl.addEventListener(event, function () {
    const nameChars: NodeListOf<HTMLElement> = document.querySelectorAll(textSelector + ".name-char");
    const bar: HTMLElement | null = document.querySelector("#header .menu-icon-item .hamburger-bar");
    const charCount = nameChars.length;
    if (this.checked) {
      // sweep left on open — right to left delay, open animate hamburger
      sweepSpanLeft(nameChars, charCount);
      bar?.classList.add("open");
    } else {
      // sweep right on close — left to right delay, close animate hamburger
        sweepSpanRight(nameChars);
        bar?.classList.remove("open");
        // close dropdowns if open; todo: should this logic live elsewhere since it's not directly related to the header sweep?
        const dropdowns: NodeListOf<HTMLInputElement> | null = document.querySelectorAll(".dropdown-toggle");
        dropdowns.forEach(dropdown => {
          if (dropdown) {
            dropdown.checked = false;
          }
        })
    }
  });
}

export function initHoverSweep(textSelector: string, eventSelector: string) {
  splitStringIntoSpans(textSelector);
  const nameChars: NodeListOf<HTMLElement> = document.querySelectorAll(textSelector + ".name-char");
  const charCount = nameChars.length;
  let hoverTime;
  if (!charCount) return;
  document.querySelector(eventSelector)?.addEventListener("mouseenter", function () {
    hoverTime = 0;
    sweepSpanLeft(nameChars, charCount);
  });
  document.querySelector(eventSelector)?.addEventListener("mouseleave", function () {
    setTimeout(() => {
      sweepSpanRight(nameChars);
    }, charCount * 40);
  });
}

export function sweepSpanBilateral(charSelector: string, charCount?: number) {
  const nameChars: NodeListOf<HTMLElement> = document.querySelectorAll(charSelector);
  charCount = charCount ?? nameChars.length;

    // sweep right to left with delay
  sweepSpanLeft(nameChars, charCount);

  // sweep left to right with delay
  setTimeout(() => {
    sweepSpanRight(nameChars);
  }, (charCount + 4) * 40);
}

export function splitStringIntoSpans(elSelector: string) {
  const nameEl = document.querySelector(elSelector);
  if (!nameEl) return;
  const words = nameEl.textContent.split(" ");
  let charIndex = 0;
  nameEl.innerHTML = words
    .map((word) => {
      const wordHtml = word
        .split("")
        .map((char) => {
          const span = `<span class="name-char" data-index="${charIndex}">${char}</span>`;
          charIndex++;
          return span;
        })
        .join("");
      return `<span style="white-space: nowrap">${wordHtml}</span>`;
    })
    .join(" ");
}

function sweepSpanLeft(nameChars: NodeListOf<HTMLElement>, charCount: number) {
  charCount = charCount ?? nameChars.length;
  nameChars.forEach((char, i) => {
    char.style.transitionDelay = `${(charCount - 1 - i) * 40}ms`;
    char.classList.add("swept");
  });
}

function sweepSpanRight(nameChars: NodeListOf<HTMLElement>) {
  nameChars.forEach((char, i) => {
    char.style.transitionDelay = `${i * 40}ms`;
    char.classList.remove("swept");
  });
}
