interface ScrollToAnchorProps {
  target: HTMLElement | null;
  container?: Element | (Window & typeof globalThis);
  includeHeader?: boolean;
  behavior?: ScrollBehavior;
}

export function scrollToTop(container: Element | (Window & typeof globalThis) = window, behavior: ScrollBehavior = "smooth") {
  container.scrollTo({ top: 0, behavior: behavior });
}

export function scrollToAnchor({target, container = window, includeHeader = false, behavior = "smooth"}: ScrollToAnchorProps) {
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  let scrollHeight = targetRect.top - 16;
  if (includeHeader === true) {
    const header: HTMLElement | null = document.querySelector("#header");
    let headerHeight = 0;
    if (header) {
      headerHeight = header.offsetHeight;
    }
    if (container != window) {
      const containerEl = container as HTMLElement;
      const containerRect = containerEl.getBoundingClientRect();
      headerHeight += containerRect.top; // account for container's position relative to viewport
    }
    scrollHeight -= headerHeight;
  }
  container.scrollBy({top: scrollHeight, left: 0, behavior: behavior});
}

export function initScrollToTop(container: HTMLElement | (Window & typeof globalThis) = window) {
  const btn = document.querySelector("#scrollToTop");
  if (!btn) return;
  btn.addEventListener("click", function () {
    scrollToTop(container);
  });
}
