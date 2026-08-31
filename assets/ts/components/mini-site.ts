import { fetchFragment, fetchIndexSvgIcons } from '../shared/asyncFetch.js';
import { initHeaderLink } from '../shared/header.js';
import { initScrollToTop } from '../shared/misc.js';
import { initNavMenu } from '../shared/nav.js';
import { closeOverlays, hideStartupOverlay, initCardOverlay } from '../shared/overlays.js';
import { loadView } from '../router.js';
import { removeClasses } from '../utils.js';
import { ViewKey } from '../types.js';

export async function initMiniSiteOverlay(loadSignal: AbortSignal) {
    let overlay = document.querySelector(".mini-site-overlay"); // do not need to initiate clean since closing refreshes index.html
    let btnLiveMiniSite: HTMLElement | null = document.querySelector("#btnMiniSite");
    let miniSite: HTMLElement | null = document.querySelector(".mini-site");

    if (!btnLiveMiniSite) return;

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

    btnLiveMiniSite.addEventListener("click", async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double-clicks from continuing
        if (document.querySelector(".mini-site.expanded-mini-site")) {
            return;
        };

        closeOverlays([".card-overlay", ".screenshot-overlay"].join(",")); // in case other overlays are open
        removeClasses(['expanded', 'view-nav']); // in case other cards are expanded
        document.querySelectorAll('[id]').forEach(el => {
            if (el.id !== "title-placeholder") { // keep title for setting later
                el.removeAttribute('id');
            }
        });

        const headerOuter = document.querySelector("header");
        if (headerOuter) {
            headerOuter.style.display = "none";
        }
        
        miniSite.classList.add("expanded-mini-site");
        overlay.classList.add("active-mini-site");

        try {
            const data = await fetchFragment({
                path: 'index.html',
                signal: loadSignal,
                validate: (response) => {
                    if (!response.ok) throw new Error(`View not found: index`);
                    return true;
                }
            });

            if (data === null) return;

            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            if (!doc.querySelector('#nav-placeholder')) {
                throw new Error("Fetched index.html missing expected structure (#nav-placeholder)");
            }

            miniSite.innerHTML = doc.body.innerHTML;
            const bodyMini: HTMLElement | null = document.querySelector('#body-placeholder');
            if (!bodyMini) { // Check after writing for error specificity
                throw new Error("Fetched index.html missing expected structure (#body-placeholder)");
            }
            await Promise.all([
                fetchIndexSvgIcons(),
                initNavMenu({navSelector: '#nav-placeholder', navHtml: 'nav', bodyElement: bodyMini, containerSelector: '.mini-site.expanded-mini-site'}),
                loadView({view: "personal-site-page", bodyElement: bodyMini, containerSelector: '.mini-site.expanded-mini-site'}),
            ]);

            initScrollToTop(miniSite);
            initHeaderLink();

            const header: HTMLElement | null = document.querySelector('#header');
            const btn: HTMLElement | null = document.querySelector('#btnMiniSiteCard');

            if (header && btn) {
                const resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        const target = entry.target as HTMLElement;
                        btn.style.top = `calc(${target.offsetHeight}px + 8px)`;
                    }
                });

                resizeObserver.observe(header);
            }

            overlay.addEventListener("click", () =>
                restorePage('personal-site-page')
            );
        } catch (error) {
            console.error("Failed to load mini-site:", error);
            restorePage('personal-site-page');
        } finally {
            hideStartupOverlay(true);
        }
    });
}

function restorePage(view: ViewKey) {
    sessionStorage.setItem("redirect", view);
    window.location.href = "/";
}
