let navMenu = document.querySelector("#nav-placeholder");
let body = document.querySelector("#body-placeholder");
let footer = document.querySelector("#footer-placeholder");
let navHtml = "nav.html";
let title = document.querySelector("#title-placeholder");

fetch(navHtml)
  .then((response) => response.text())
  .then((data) => {
    navMenu.innerHTML = data;
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
  });

function fetchSection(viewPage, section, pageTitle) {
  fetch(viewPage)
    .then((response) => response.text())
    .then((data) => {
      section.innerHTML = data;
    })
    .then((title.innerHTML = pageTitle));
}

function loadView(viewName) {
  fetch(`views/${viewName}.html`)
    .then((response) => {
      if (!response.ok) throw new Error("View not found");
      return response.text();
    })
    .then((html) => {
      body.innerHTML = html;
      title.innerHTML = viewName.charAt(0).toUpperCase() + viewName.slice(1).replace(/-/g, " ");
      const checkNav = document.querySelector("#checkNav");
      if (checkNav) {
        checkNav.checked = false;
        checkNav.dispatchEvent(new Event('change'));
      }
      const workDropdown = document.querySelector("#workDropdown");
      if (workDropdown) {
        workDropdown.checked = false;
      }
      history.pushState({ view: viewName }, "", `/${viewName}`);
      const baseCallbacks = [() => { initAnchorButtons(), initSvgIcons(), initFeatureCards(),initFooterButtons() }];
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
      loadView("home"); // show a "page not found" message?
    });
}

function addBtnListener(btnId, viewName) {
      const el = document.querySelector(btnId);
      if (!el) return;
      el.addEventListener("click", function (event) {
        event.preventDefault();
        loadView(viewName);
      });
}

const viewCallbacks = {
  work: [
    () => addBtnListener("#btnWordPressWork", "wordpress-plugins"),
    () => addBtnListener("#btnNYCDashboardWork", "nyc-dashboard"),
    () => addBtnListener("#btnReportDownloadHubWork", "report-download-hub")
  ]
};

document.querySelector('.scroll-to-top-btn').addEventListener('click', function() {
  scrollToTop();
});

document.querySelector('.header-link').addEventListener("click", function (event) {
        event.preventDefault();
        loadView("work");
});



function scrollToTop(behavior = "smooth") {
    window.scrollTo({ top: 0, behavior: behavior });
}

function initAnchorButtons() {
  document.querySelectorAll('.page-tag-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const target = document.getElementById(this.dataset.target);
          if (!target) return;
          // Account for fixed position header
          const headerHeight = document.querySelector('.header').offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16; // 16px padding
          window.scrollTo({ top, behavior: 'smooth' });
      });
  });
}

function initFooterButtons() {
    const viewNav = document.querySelector('.view-nav');
    let back = document.querySelector('#footer-back-btn');
    let next = document.querySelector('#footer-next-btn');

    // Clone to remove accumulated listeners
    if (back) {
        const backClone = back.cloneNode(true);
        back.parentNode.replaceChild(backClone, back);
        back = backClone;
    }
    if (next) {
        const nextClone = next.cloneNode(true);
        next.parentNode.replaceChild(nextClone, next);
        next = nextClone;
    }

    if (!viewNav) {
        if (back) back.innerHTML = "";
        if (next) next.innerHTML = "";
        return;
    }

    if (back && viewNav.dataset.backText) {
        back.innerHTML = `&larr; ${viewNav.dataset.backText}`;
        back.addEventListener('click', function(event) {
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
          next.addEventListener('click', function(event) {
            event.preventDefault();
            loadView(viewNav.dataset.nextView);
          });
        }
      } else if (next) {
        next.innerHTML = "";
      }
}

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

function initHeaderSweep() {
    const nameEl = document.querySelector('header h1 span');
    const words = nameEl.textContent.split(' ');
    let charIndex = 0;
    nameEl.innerHTML = words.map(word => {
        const wordHtml = word.split('').map(char => {
            const span = `<span class="name-char" data-index="${charIndex}">${char}</span>`;
            charIndex++;
            return span;
        }).join('');
        return `<span style="white-space: nowrap">${wordHtml}</span>`;
    }).join(' ');

    document.getElementById('checkNav').addEventListener('change', function() {
        const nameChars = document.querySelectorAll('.name-char');
        if (this.checked) {
            // sweep left on open — right to left delay
            nameChars.forEach((char, i) => {
                char.style.transitionDelay = `${(nameChars.length - 1 - i) * 40}ms`;
                char.classList.add('swept');
            });
        } else {
            // sweep right on close — left to right delay
            nameChars.forEach((char, i) => {
                char.style.transitionDelay = `${i * 40}ms`;
                char.classList.remove('swept');
            });
        }
    });
}

function initSvgIcons() {
    const icons = document.querySelectorAll('.svg-icon');
    if (!icons.length) return;
    icons.forEach(icon => {
      if (!icon.dataset.target) return;
      fetch(`assets/images/${icon.dataset.target}.svg`)
          .then(response => {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('svg')) return null;
            return response.text();
          })
          .then(svg => {
              if (!svg) return;
              icon.innerHTML = svg;
          })
          .catch(error => console.error("SVG load failed:", error));
    });
}

function initFeatureCards() {
    const overlay = document.querySelector('.card-overlay');
    const cards = document.querySelectorAll('.feature-card');

    if (!overlay || !cards.length)
      {
        return;
      }

    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.add('expanded');
            overlay.classList.add('active');
        });
    });

    overlay.addEventListener('click', function() {
        document.querySelector('.feature-card.expanded')
            ?.classList.remove('expanded');
        this.classList.remove('active');
    });
}