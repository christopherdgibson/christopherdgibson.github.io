export function toPascalCase(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function toPageTitleCase(input: string) {
  return toPascalCase(input).replace(/-/g, " ");
}

export function normalizeViewPath(path: string, base: string): string {
  let result = path;
  if (result.startsWith(base)) {
    result = result.slice(base.length);
  }
  result = result.replace(/^\/+/, "").replace(/\/+$/, "");
  return result;
}

export function getContainer(containerSelector?: string): HTMLElement | (Window & typeof globalThis) {
  let container: (Window & typeof globalThis) | HTMLElement | null;
  if (containerSelector !== undefined) {
    container = document.querySelector(containerSelector);
  } else {
    container = window;
  }

  return container ?? window;
}

export function removeClasses(classNames: string[]) {
  classNames.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`)
    if (elements.length) {
    elements.forEach(el => el.classList.remove(className));
    }
  });
}

export function getCleanElement<T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T | null {
  const el = parent.querySelector(selector);
  if (!el) return null;
  const elClone = el.cloneNode(true) as T;
  el.parentNode?.replaceChild(elClone, el);

  return elClone;
}

export function getCleanElements<T extends Element = HTMLElement>(selector: string) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  let elClones: HTMLElement[] = [];
  els.forEach((el) => {
    const elClone = el.cloneNode(true) as HTMLElement;
    el.parentNode?.replaceChild(elClone, el);
    elClones?.push(elClone);
  });

  return elClones;
}
