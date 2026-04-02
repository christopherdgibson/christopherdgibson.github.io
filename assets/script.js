// Global variables in index.html for single query and reuse
let body = document.querySelector("#body-placeholder");
let footer = document.querySelector("#footer-placeholder");
let title = document.querySelector("#title-placeholder");

/* ────────── Load navbar and menu events ────────── */
let navMenu = document.querySelector("#nav-placeholder");
fetch("nav.html")
  .then((response) => response.text())
  .then((data) => {
    navMenu.innerHTML = data;
    fetchIndexSvgIcons();
    initHeaderSweep();
    document
      .querySelector("#btnHome")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("home");
      });
    document
      .querySelector("#btnExperience")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("experience");
      });
    document
      .querySelector("#btnResearch")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("research");
      });
    document
      .querySelector("#btnTeaching")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("teaching");
      });
    document
      .querySelector("#btnWork")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("work");
      });
    document
      .querySelector("#btnWorkMobile")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("work");
      });
    document
      .querySelector("#btnNYCDashboard")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("nyc-dashboard");
      });
    document
      .querySelector("#btnReportDownloadHub")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("report-download-hub");
      });
    document
      .querySelector("#btnWordPress")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("wordpress-plugins");
      });
    document
      .querySelector("#btnPersonalSite")
      .addEventListener("click", function (event) {
        event.preventDefault();
        loadView("personal-site-page");
      });
  });

/* ────────── SPA swapping logic ────────── */
function loadView(viewName) {
  fetch(`views/${viewName}.html`)
    .then((response) => {
      if (!response.ok) throw new Error("View not found");
      return response.text();
    })
    .then((html) => {
      body.innerHTML = html; // todo: check and throw error if not found? (e.g., if (!body) { throw new Error("Body placeholder not found");})
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
      const baseCallbacks = [
        () => {
          (initAnchorButtons(),
            initSvgIcons(),
            initFooterButtons(),
            initCleanOverlays([".card-overlay", ".screenshot-overlay"]),
            initFeatureCards(),
            initScreenshots());
        },
      ];
      const viewSpecific = viewCallbacks[viewName] ?? [];
      const callbacks = [...baseCallbacks, ...viewSpecific];
      if (!callbacks) return;
      callbacks.forEach(cb => cb());
    })
    .then(() => {
      const images = body.querySelectorAll("img");
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
      scrollToTop();
    })
    .catch((error) => {
      // Fallback to home view or show error message
      console.error("Failed to load view:", error);
      loadView("home"); // todo: show a "page not found" message?
    });
}

/* ────────── View Callbacks ────────── */
const viewCallbacks = {
  work: [
    () => addBtnListener("#btnNYCDashboardWork", "nyc-dashboard"),
    () => addBtnListener("#btnReportDownloadHubWork", "report-download-hub"),
    () => addBtnListener("#btnWordPressWork", "wordpress-plugins"),
    () => addBtnListener("#btnPersonalSiteWork", "personal-site-page"),
  ],
  "personal-site-page": [() => initCarousel()],
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

function initAnchorButtons() {
  document.querySelectorAll(".page-tag-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.target);
      if (!target) return;
      // Account for fixed position header
      const headerHeight = document.querySelector(".header").offsetHeight;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerHeight - 16; // 16px padding
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

function initFooterButtons() {
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
      loadView(viewNav.dataset.backView);
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
        loadView(viewNav.dataset.nextView);
      });
    }
  } else if (next) {
    next.innerHTML = "";
  }
}

function initHeaderSweep() {
  const nameEl = document.querySelector("header h1 span");
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

  document.getElementById("checkNav").addEventListener("change", function () {
    const nameChars = document.querySelectorAll(".name-char");
    if (this.checked) {
      // sweep left on open — right to left delay
      nameChars.forEach((char, i) => {
        char.style.transitionDelay = `${(nameChars.length - 1 - i) * 40}ms`;
        char.classList.add("swept");
      });
    } else {
      // sweep right on close — left to right delay
      nameChars.forEach((char, i) => {
        char.style.transitionDelay = `${i * 40}ms`;
        char.classList.remove("swept");
      });
    }
  });
}

function fetchIndexSvgIcons() {
  const navIcon = document.querySelector(".checkbtn");
  const linkedInIcon = document.querySelector(".footer-social");
  fetchSvgIcon(navIcon, "assets/images/nav-icon.svg");
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
  initOverlay(".card-overlay", ".feature-card");
}

function initOverlay(
  overlaySelector,
  itemSelector,
  expandedClass = "expanded",
  activeClass = "active",
) {
  const overlay = document.querySelector(overlaySelector);
  const items = document.querySelectorAll(itemSelector);

  if (!overlay || !items.length) {
    return;
  }

  items.forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.add(`${expandedClass}`);
      overlay.classList.add(`${activeClass}`);
    });
  });
}

function initScreenshots() {
  const overlay = document.querySelector(".screenshot-overlay");
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
      document.querySelector(".expanded")?.classList.remove("expanded");
      this.classList.remove("active");
    });
  });
}

function initScreenshotsNew() {
  const overlay = document.querySelector(".screenshot-overlay");
  const overlayImg = document.querySelector(".screenshot-overlay-img");
  const chevronLeft = document.querySelector(".chevron-left");
  const chevronRight = document.querySelector(".chevron-right");
  const wrappers = document.querySelectorAll(".screenshot-wrapper");
  if (!overlay || !wrappers.length) return;

  let images = [];
  let current = 0;

  function showImage(index) {
    current = (index + images.length) % images.length; // wraps around
    overlayImg.src = images[current];
    chevronLeft.style.visibility = images.length > 1 ? "visible" : "hidden";
    chevronRight.style.visibility = images.length > 1 ? "visible" : "hidden";
  }

  wrappers.forEach((wrapper) => {
    wrapper.addEventListener("click", function () {
      images = JSON.parse(this.dataset.images);
      current = parseInt(this.dataset.current ?? 0);
      showImage(current);
      this.classList.add("expanded");
      //overlay.removeAttribute('hidden');
      overlay.classList.add("active");
    });
  });

  chevronLeft.addEventListener("click", function (e) {
    e.stopPropagation();
    showImage(current - 1);
  });

  chevronRight.addEventListener("click", function (e) {
    e.stopPropagation();
    showImage(current + 1);
  });

  overlay.addEventListener("click", function () {
    //overlay.setAttribute('hidden', '');
    this.classList.remove("active");
  });
}

// Carousel JS

function initCarousel() {
  const track = getCleanElement("#carouselTrack");
  if (!track) return;
  const dots = document.querySelectorAll(".carousel-dot"); // clean dot elements as well with getCleanElements()?
  const prev = getCleanElement("#carouselPrev");
  const next = getCleanElement("#carouselNext");
  const navItems = document.querySelectorAll("#carouselNav .mockup-nav-item");
  const total = dots.length;
  let current = 0;
  let autoplay;

  function setActive(index) {
    navItems.forEach((item, i) => item.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
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

/* ────────── Base listeners ────────── */
document
  .querySelector(".scroll-to-top-btn")
  .addEventListener("click", function () {
    scrollToTop();
  });

document
  .querySelector(".header-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    loadView("work");
  });

/* ────────── Helper functions ────────── */

function scrollToTop(behavior = "smooth") {
  window.scrollTo({ top: 0, behavior: behavior });
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

/* ────────── Navigation handling with History API and graceful fallback ────────── */
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