// Global variables in index.html for single query and reuse
// let body = document.querySelector("#body-placeholder");
let footer = document.querySelector("#footer-placeholder");
let title = document.querySelector("#title-placeholder");

/* ────────── Load navbar and menu events ────────── */
// let navMenu = document.querySelector("#nav-placeholder");

function initNavMenu(navSelector, navHtml, bodyElement = document.querySelector("#body-placeholder")) {
  const navMenu = document.querySelector(navSelector);
  fetch(navHtml)
    .then((response) => response.text())
    .then((data) => {
      navMenu.innerHTML = data;
      fetchIndexSvgIcons();
      initHeaderSweep();
      addNavClick("#btnHome", "home", bodyElement);
      addNavClick("#btnExperience", "experience", bodyElement);
      addNavClick("#btnWork", "work", bodyElement);
      addNavClick("#btnWorkMobile", "work", bodyElement);
      addNavClick("#btnResearch", "research", bodyElement);
      addNavClick("#btnTeaching", "teaching", bodyElement);
      addNavClick("#btnNYCDashboard", "nyc-dashboard", bodyElement);
      addNavClick("#btnReportDownloadHub", "report-download-hub", bodyElement);
      addNavClick("#btnWordPress", "wordpress-plugins", bodyElement);
      addNavClick("#btnPersonalSite", "personal-site-page", bodyElement);
    });
  }

function addNavClick(selector, view, bodyElement) {
  document.querySelector(selector).addEventListener("click", function(event) {
    event.preventDefault();
    loadView(view, bodyElement);
  });
}

initNavMenu('#nav-placeholder', 'nav.html');

/* ────────── SPA swapping logic ────────── */
function loadView(viewName, bodyEl = document.querySelector("#body-placeholder")) {
  fetch(`views/${viewName}.html`)
    .then((response) => {
      if (!response.ok) throw new Error("View not found");
      return response.text();
    })
    .then((html) => {
      bodyEl.innerHTML = html; // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body placeholder not found");})
      title.innerHTML =
        viewName.charAt(0).toUpperCase() + viewName.slice(1).replace(/-/g, " ");
      const checkNav = document.querySelector("#checkNav");
      if (checkNav) {
        checkNav.checked = false;
        checkNav.dispatchEvent(new Event("change"));
      }
      const workDropdown = document.querySelector("#workDropdown");
      if (workDropdown) {
        workDropdown.checked = false;
      }
      history.pushState({ view: viewName }, "", `/${viewName}`);
      const miniSite = document.querySelector('.mini-site.expanded-mini-site');
      container = miniSite ?? window;
      const baseCallbacks = [
        () => {(
            initAnchorButtons(container),
            initSvgIcons(),
            initFooterButtons(),
            initCleanOverlays([".card-overlay", ".screenshot-overlay"]), // include base and mini-site overlays?
            initCardOverlay("#screenshotOverlay", "miniSiteCard"),
            initFeatureCards(),
            initScreenshots()
          );
        },
      ];
      const viewSpecific = viewCallbacks[viewName] ?? [];
      const callbacks = [...baseCallbacks, ...viewSpecific];
      if (!callbacks) return;
      callbacks.forEach(cb => cb());
    })
    .then(() => {
      const images = bodyEl.querySelectorAll("img");
      const imagePromises = Array.from(images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
        );
      return Promise.all(imagePromises);
    })
    .then(() => {
      scrollToTop(container);
    })
    .catch((error) => {
      // Fallback to home view or show error message
      console.error("Failed to load view:", error);
      loadView("home"); // todo: show a "page not found" message?
    });
}

/* ─── View Callbacks ─── */
const viewCallbacks = {
    home: [
    () => addBtnListener("#btnWorkHome", "work"),
    () => addBtnListener("#btnExperienceHome", "experience"),
  ],
  work: [
    () => initHoverSweep("#btnPersonalSiteWork .mockup-site-name span", "#btnPersonalSiteWork"),
    () => sweepSpanBilateral(".name-char"),
    () => addBtnListener("#btnNYCDashboardWork", "nyc-dashboard"),
    () => addBtnListener("#btnReportDownloadHubWork", "report-download-hub"),
    () => addBtnListener("#btnWordPressWork", "wordpress-plugins"),
    () => addBtnListener("#btnPersonalSiteWork", "personal-site-page")
  ],
  "report-download-hub": [
    () => initCardOverlay("#screenshotOverlay", "reportDownloadHubExe", "btnReportDownloadHubExe"),
    () => initDownloadModal()
  ],
  "wordpress-plugins": [
    () => initCardOverlay("#screenshotOverlay", "comingSoonCard", "btnWordPressDemo")
  ],
  "personal-site-page": [
    () => initCarousel(),
    () => initHoverSweep("#carouselWrapper .mockup-site-name span", "#carouselWrapper"),
    () => initCardOverlay("#screenshotOverlay", "hamburgerCard"),
    () => initHamburgerAnimation(),
    () => initMiniSiteOverlay(),
    () => addBtnListener("#btnHomeCarousel", "home"),
    () => addBtnListener("#btnExperienceCarousel", "experience"),
    () => addBtnListener("#btnWorkCarousel", "work"),
    () => addBtnListener("#btnResearchCarousel", "research"),
    () => addBtnListener("#btnTeachingCarousel", "teaching"),
  ],
};

function addBtnListener(btnId, viewName) {
  const el = document.querySelector(btnId);
  if (!el) return;
  el.addEventListener("click", function (event) {
    event.preventDefault();
    loadView(viewName);
  });
}

/* ────────── Base Callbacks ────────── */

function initAnchorButtons(container = window, behavior = "smooth") {
  document.querySelectorAll(".page-tag-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.target);
      if (!target) return;
      let headerHeight = document.querySelector("#header").offsetHeight;
      if (container != window) {
        const containerRect = container.getBoundingClientRect();
        headerHeight += containerRect.top; // account for container's position relative to viewport
      }
      // Account for fixed position header and current height
      const targetRect = target.getBoundingClientRect();
      container.scrollBy({top: targetRect.top - headerHeight - 16, left: 0, behavior: behavior});
    });
  });
}

function initFooterButtons(bodyElement) {
  const viewNav = document.querySelector(".view-nav");
  let back = getCleanElement('#footer-back-btn');
  let next = getCleanElement('#footer-next-btn');

  if (!viewNav) {
    if (back) back.innerHTML = "";
    if (next) next.innerHTML = "";
    return;
  }

  if (back && viewNav.dataset.backText) {
    back.innerHTML = `&larr; ${viewNav.dataset.backText}`;
    back.addEventListener("click", function (event) {
      event.preventDefault();
      loadView(viewNav.dataset.backView, bodyElement);
    });
  } else if (back) {
    back.innerHTML = "";
  }

  if (next && viewNav.dataset.nextText) {
    if (viewNav.dataset.nextLink) {
      next.innerHTML = `<a href='${viewNav.dataset.nextLink}' target='_blank'> ${viewNav.dataset.nextText} &rarr; </a>`;
    } else if (viewNav.dataset.nextView) {
      next.innerHTML = `${viewNav.dataset.nextText} &rarr;`;
      next.addEventListener("click", function (event) {
        event.preventDefault();
        loadView(viewNav.dataset.nextView, bodyElement);
      });
    }
  } else if (next) {
    next.innerHTML = "";
  }
}

function initHeaderSweep(textSelector = "#headerLink span", eventSelector = "#checkNav", event = "change") {
  splitStringIntoSpans(textSelector);

  document.querySelector(eventSelector).addEventListener(event, function () {
    const nameChars = document.querySelectorAll(textSelector + ".name-char");
    const bar = document.querySelector(".menu-icon-item .hamburger-bar");
    const charCount = nameChars.length;
    if (this.checked) {
      // sweep left on open — right to left delay, open animate hamburger
      sweepSpanLeft(nameChars, charCount);
      bar.classList.add("open");
    } else {
      // sweep right on close — left to right delay, close animate hamburger
        sweepSpanRight(nameChars);
        bar.classList.remove("open");
        // close work dropdown if open; todo: should this logic live elsewhere since it's not directly related to the header sweep?
        const workDropwown = document.querySelector("#workDropdown");
        if (workDropwown) {
          workDropwown.checked = false;
        }
    }
  });
}

function initHoverSweep(textSelector, eventSelector) {
  splitStringIntoSpans(textSelector);
  const nameChars = document.querySelectorAll(textSelector + ".name-char");
  const charCount = nameChars.length;
  let hoverTime;
  if (!charCount) return;
  document.querySelector(eventSelector).addEventListener("mouseenter", function () {
    hoverTime = 0;
    sweepSpanLeft(nameChars, charCount);
  });
  document.querySelector(eventSelector).addEventListener("mouseleave", function () {
    setTimeout(() => {
      sweepSpanRight(nameChars);
    }, charCount * 40);
  });
}

function sweepSpanBilateral(charSelector, charCount) {
  const nameChars = document.querySelectorAll(charSelector);
  charCount = charCount ?? nameChars.length;

    // sweep right to left with delay
  sweepSpanLeft(nameChars, charCount);

  // sweep left to right with delay
  setTimeout(() => {
    sweepSpanRight(nameChars);
  }, (charCount + 4) * 40);
}

function splitStringIntoSpans(elSelector) {
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

function sweepSpanLeft(nameChars, charCount) {
  charCount = charCount ?? nameChars.length;
  nameChars.forEach((char, i) => {
    char.style.transitionDelay = `${(charCount - 1 - i) * 40}ms`;
    char.classList.add("swept");
  });
}

function sweepSpanRight(nameChars) {
  nameChars.forEach((char, i) => {
    char.style.transitionDelay = `${i * 40}ms`;
    char.classList.remove("swept");
  });
}

function fetchIndexSvgIcons() {
  const linkedInIcon = document.querySelector(".footer-social");
  fetchSvgIcon(linkedInIcon, "assets/images/linkedin-icon.svg");
}

function fetchSvgIcon(iconEl, iconPath) {
  if (!iconEl) return;
  fetch(iconPath)
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("svg")) return null;
      return response.text();
    })
    .then((svg) => {
      if (!svg) return;
      iconEl.innerHTML = svg;
    })
    .catch((error) => console.error("SVG load failed:", error));
}

function initSvgIcons() {
  const icons = document.querySelectorAll(".svg-icon");
  if (!icons.length) return;
  icons.forEach((icon) => {
    if (!icon.dataset.target) return;
    fetchSvgIcon(icon, `assets/images/${icon.dataset.target}.svg`);
  });
}

function initFeatureCards() {
  initOverlay("#cardOverlay", ".feature-card");
}

function initOverlay(
  overlaySelector,
  itemSelector,
  minWidth = 768,
  proxySelector = null,
  expandedClass = "expanded",
  activeClass = "active") {
  const overlay = document.querySelector(overlaySelector);
  const items = document.querySelectorAll(itemSelector);

  if (!overlay || !items.length) {
    return;
  }

  let proxy = null;
  if (proxySelector) {
    proxy = document.querySelector(proxySelector);
    proxy.addEventListener("click", function(e) {
      e.preventDefault();
    })
  }

  items.forEach((item) => {
    const itemEvent = proxy ?? item;
    itemEvent.addEventListener("click", function () {
      if (window.innerWidth > minWidth) return;
      this.classList.add(`${expandedClass}`);
      overlay.classList.add(`${activeClass}`);
    });
  });
}

function initMiniSiteOverlay() {
  let overlay = document.querySelector(".mini-site-overlay"); // do not need to initiate clean since closing refreshes index.html
  let btnLiveMiniSite = document.querySelector("#btnMiniSite");
  let miniSite = document.querySelector(".mini-site");

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
    closeOverlays([".card-overlay", ".screenshot-overlay"]); // in case other overlays are open (should I instead remove active or do I need an event assigned? initCleanOverlays() instead?)
    removeClasses(['expanded', 'view-nav']); // in case other cards are expanded
    document.querySelectorAll('[id]').forEach(el => { el.removeAttribute('id'); });
    document.querySelector("header").style.display = "none";
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
        initNavMenu('#nav-placeholder', 'nav.html', bodyMini);
        loadView("personal-site-page", bodyMini);
        initScrollToTop(miniSite);
        initHeaderLink();
        const headerHeight = document.querySelector("#header").offsetHeight;
        document.querySelector('#btnMiniSiteCard').style.top = `calc(${headerHeight}px + 8px)`;
        overlay.addEventListener("click", function () {
          sessionStorage.setItem("redirect", "personal-site-page");
          window.location.href = "/";
        });
      });
  });
}

function initCardOverlay(overlaySelector, itemId, btnId) {
  btnId = btnId ?? `btn${toPascalCase(itemId)}`;
  const overlay = document.querySelector(overlaySelector);
  const btn = document.getElementById(btnId);

  if (!overlay || !btn) {
    return;
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeOverlays(["#cardOverlay", "#screenshotOverlay"]); // in case other overlays are open; todo: can just removeClasses active?
    removeClasses(['expanded']); // in case other cards are expanded
    document.getElementById(itemId).classList.add("expanded");
    overlay.classList.add("active");
  });
}

function initHamburgerAnimation() {
  const hamburger = document.querySelector(".hamburger-btn");
  const hamburgerClick = document.querySelector('.hamburger-click');
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

  function addClickEvent(index) {
    current = (index + total + 1) % (total + 1);
    if (current == 0) {
      cycles++;
      hamburger.classList = "hamburger-btn";
      if (cycles >= 2 && cycles <= 10 || cycles == limit) {
        let text;
        if (cycles != limit) {
          if (cycles == 2) { text = "Did you notice that if you double-click the area quickly enough a highlighted hamburger pops up?"}
          else if (cycles == 10) { text = "I may start with quotes of the day at this point..."}
          else { text = cycles==3 ? "Aren't you full by now?" : "You've been at this for a while now.";}
          hamburgerClick.innerHTML = text;
        } else {
          hamburgerClick.innerHTML = `At this point I would invite you to look into the code to read all the messages. Or keep clicking. If you are this thorough I\'m sure we would get along so feel free contact me by <a id="hamburgerEmail" href="mailto:cdg2131@columbia.edu">email!</a> This message intentionally broke the card height so you could see one more new thing. Was it worth doing this ${limit} times?`;
          document.querySelector("#hamburgerEmail").addEventListener("click", function(e) {
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

  document.querySelector('.modal-card').addEventListener("click", () => {
    addClickEvent(current + 1);
  });
}

function initScreenshots() {
  const overlay = document.querySelector("#screenshotOverlay");
  const wrappers = document.querySelectorAll(".screenshot-wrapper");
  if (!overlay || !wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const img = wrapper.querySelector(".hero-screenshot");
    const chevronLeft = document.querySelector(".chevron-left");
    const chevronRight = document.querySelector(".chevron-right");
    const images = JSON.parse(wrapper.dataset.images);
    let current = 0;

    // create chevrons dynamically
    // const left = document.createElement('button');
    // const right = document.createElement('button');
    // left.className = 'chevron chevron-left';
    // right.className = 'chevron chevron-right';
    // left.innerHTML = '&#8249;';
    // right.innerHTML = '&#8250;';
    // wrapper.appendChild(left);
    // wrapper.appendChild(right);

    if (images.length <= 1) {
      chevronLeft.style.visibility = "hidden";
      chevronRight.style.visibility = "hidden";
    } else {
      chevronLeft.addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(current - 1);
      });

      chevronRight.addEventListener("click", (e) => {
        e.stopPropagation();
        showImage(current + 1);
      });
    }

    function showImage(index) {
      current = (index + images.length) % images.length;
      img.src = images[current];
    }

    wrappers.forEach((wrapper) => {
      wrapper.addEventListener("click", function () {
        this.classList.add("expanded");
        overlay.classList.add("active");
      });
    });
  });
}

// Clear overlay event listeners to prevent stacking on multiple view loads
function initCleanOverlays(overlaySelectors) {
  const overlays = getCleanElements(overlaySelectors);
  overlays.forEach((overlay) => {
    overlay.addEventListener("click", function () {
      const expanded = document.querySelectorAll(".expanded, .hidden");
      if (expanded.length) {
        expanded.forEach((el) => {
          el.classList.remove("expanded");
          el.classList.remove("hidden");
        });
      }
      this.classList.remove("active");
    });
  });
}

function closeOverlays(overlaySelectors) {
  const overlays = document.querySelectorAll(overlaySelectors);
  overlays.forEach((overlay) => {
    overlay.addEventListener("click", function () {
      removeClasses(['active']);
    });
  });
}

function removeClasses(classNames) {
  classNames.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`)
    if (elements.length) {
    elements.forEach(el => el.classList.remove(className));
    }
  });
}

// Download modal
function initDownloadModal() {
  let downloadBtn = document.getElementById('btnDownloadConfirm');
  let downloadOptions = document.querySelectorAll('#reportDownloadHubExe .download-option');
  let downloadModal = document.getElementById('reportDownloadHubExe');
  let downloadConfirmModal = document.getElementById('downloadConfirmModal');
  downloadOptions.forEach(downloadOption => {
    downloadOption.addEventListener('click', (e) => {
      e.preventDefault();
      const pendingDownloadUrl = e.currentTarget.href;
      document.querySelector('.modal-highlight').textContent = e.currentTarget.dataset.platform;
      document.querySelector('.modal-footer-note').textContent = e.currentTarget.dataset.note;
      if (pendingDownloadUrl) {
        downloadBtn.href = pendingDownloadUrl;
      }
      downloadModal.classList.add('hidden');
      downloadConfirmModal.classList.remove('hidden');
      downloadConfirmModal.classList.add('expanded');
      // showModal('downloadConfirmModal');
    });
  });

  document.getElementById('btnDownloadConfirm').addEventListener('click', () => {
    showToast('Your download will begin shortly.');
  });
  
  downloadConfirmModal.querySelectorAll('[id]').forEach(btn => {
    btn.addEventListener('click', () => {
      // showModal(btn.parentElement.id, false);
      // showModal('reportDownloadHubExe');
      downloadConfirmModal.classList.add('hidden');
      downloadModal.classList.remove('hidden');
    });
  });

  downloadModal.querySelector('.page-tag-close-container').addEventListener('click', function() {
    downloadModal.classList.remove('expanded');
    document.getElementById('screenshotOverlay').classList.remove('active');
  });
}

function showModal(modalId, show = true) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (show) {
    removeClasses(['expanded']);
    modal.classList.add("expanded");
    } else {
    modal.classList.remove("expanded");
    }
  }
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}

// Carousel JS

function initCarousel() {
  const track = getCleanElement("#carouselTrack");
  if (!track) return;
  const dots = document.querySelectorAll("#carouselWrapper .carousel-dot"); // clean dot elements as well with getCleanElements()?
  const prev = getCleanElement("#carouselPrev");
  const next = getCleanElement("#carouselNext");
  const navItems = document.querySelectorAll("#carouselNav .mockup-nav-item");
  const total = dots.length;
  let current = 0;
  let autoplay;

  function setActive(index) {
    navItems.forEach((item, i) => item.classList.toggle("activeCarousel", i === index));
    dots.forEach((d, i) => d.classList.toggle("activeCarousel", i === index));
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function goTo(index) {
    current = (index + total) % total;
    setActive(current);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
  }

  function startInterval() {
    autoplay = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAutoplay() {
    stopAutoplay();
    startInterval();
  }

  // add event listeners
  prev.addEventListener("click", () => {
    goTo(current - 1);
    resetAutoplay();
  });
  next.addEventListener("click", () => {
    goTo(current + 1);
    resetAutoplay();
  });
  dots.forEach((d) =>
    d.addEventListener("click", () => {
      goTo(+d.dataset.index);
      resetAutoplay();
    }),
  );
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startInterval);

  // start
  startInterval();
}

/* ────────── Helper functions ────────── */

function toPascalCase(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function scrollToTop(container = window, behavior = "smooth") {
  container.scrollTo({ top: 0, behavior: behavior });
}

function getCleanElement(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const elClone = el.cloneNode(true);
  el.parentNode.replaceChild(elClone, el);

  return elClone;
}

function getCleanElements(selector) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const elClones = [];
  els.forEach((el) => {
    const elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
    elClones.push(elClone);
  });

  return elClones;
}

/* ────────── Initialise on start-up ────────── */

/* ─── Index-page listeners ─── */
function initScrollToTop(container = window) {
  const btn = document.querySelector("#scrollToTop");
  if (!btn) return;
  btn.addEventListener("click", function () {
    scrollToTop(container);
  });
}

function initHeaderLink() {
  const headerLink = document.querySelector("#headerLink");
  if (!headerLink) return;
  headerLink.addEventListener("click", function (event) {
    event.preventDefault();
    loadView("work"); //todo: do these apply to mini-site?
  });
}

initScrollToTop();
initHeaderLink();

/* ─── Navigation handling with History API and graceful fallback ─── */

// Listen for back/forward button
window.addEventListener("popstate", (event) => {
  if (event.state && event.state.view) {
    loadView(event.state.view);
  } else {
    // Load default/home view
    loadView("home");
  }
});

// Handle refresh - check URL on page load
window.addEventListener("DOMContentLoaded", () => {
  // Check for 404 redirect first
  const redirect = sessionStorage.getItem("redirect");
  if (redirect) {
    sessionStorage.removeItem("redirect");
    const view = redirect.replace("/", "");
    loadView(view);
    return; // Exit early after handling the redirect
  }

  // Otherwise handle normal refresh/direct navigation
  const path = window.location.pathname.replace("/", "");
  if (path && path !== "index.html") {
    loadView(path);
  } else {
    loadView("home"); // default view
  }
});