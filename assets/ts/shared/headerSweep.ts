

export function initHeaderSweep(textSelector: string = "#headerLink span", eventSelector: string = "#checkNav", event: any = "change") {
  splitStringIntoSpans(textSelector);

  const eventEl: HTMLInputElement | null = document.querySelector(eventSelector);
  if (eventEl === null) return;
  eventEl.addEventListener(event, function () {
    const nameChars: NodeListOf<HTMLElement> = document.querySelectorAll(textSelector + ".name-char");
    const bar: HTMLElement | null = document.querySelector(".menu-icon-item .hamburger-bar");
    const charCount = nameChars.length;
    if (this.checked) {
      // sweep left on open — right to left delay, open animate hamburger
      sweepSpanLeft(nameChars, charCount);
      bar?.classList.add("open");
    } else {
      // sweep right on close — left to right delay, close animate hamburger
        sweepSpanRight(nameChars);
        bar?.classList.remove("open");
        // close work dropdown if open; todo: should this logic live elsewhere since it's not directly related to the header sweep?
        const workDropdown: HTMLInputElement | null = document.querySelector("#workDropdown");
        if (workDropdown) {
          workDropdown.checked = false;
        }
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