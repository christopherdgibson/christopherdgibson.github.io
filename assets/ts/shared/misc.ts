interface ScrollToAnchorProps {
  target: HTMLElement;
  container?: Element | (Window & typeof globalThis);
  includeHeader?: boolean;
  behavior?: ScrollBehavior;
}

interface FetchFragmentProps {
  path: string;
  validate?: (response: Response) => boolean;
}

export function fetchSvgIcon(iconEl: HTMLElement | null, iconName: string) {
  if (!iconEl) return;
  fetchFragment({
    path: `svgs/${iconName}.svg`,
    validate: (response) => {
      const contentType = response.headers.get("content-type");
      return !!contentType && contentType.includes("svg");
    }
  })
  .then((svg) => {
    if (!svg) return;
    iconEl.innerHTML = svg;
  })
  .catch((error) => console.error("SVG load failed:", error));
}

export function fetchIndexSvgIcons() {
  const linkedInIcon: HTMLElement | null = document.querySelector("#footerIcon");
  fetchSvgIcon(linkedInIcon, "linkedin");
}

export async function fetchFragment({path, validate = (response) => response.ok}: FetchFragmentProps): Promise<string | null> {
  const base = import.meta.env.BASE_URL;
  const response = await fetch(`${base}${path}`);
  if (!validate(response)) {
    return null;
  }
  const text = await response.text();
  if (base === "/") return text;
  const resolvedHtml = text.replace(/(["'(])\/(demos|downloads|images|pdfs|svgs|views)\//g, `$1${base}$2/`);
  return resolvedHtml;
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
