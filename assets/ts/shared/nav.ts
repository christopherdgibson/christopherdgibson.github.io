import { initHeaderSweep } from './headerSweep.js';
import { fetchFragment } from './misc.js';
import loadView from '../router.js'

import type { ViewKey } from '../types.js';


/* ────────── Load navbar and menu events ────────── */

export function initNavMenu(navSelector: string, navHtml: string, bodyElement: Element | null | undefined = document.querySelector("#body-placeholder"), containerSelector?: string) {
  const navMenu = document.querySelector(navSelector);
  if (navMenu === null) return;
    fetchFragment(`${navHtml}.html`)
    .then((data) => {
      navMenu.innerHTML = data;
      initHeaderSweep();
      addNavClick("#btnHome", "home", bodyElement, containerSelector);
      addNavClick("#btnExperience", "experience", bodyElement, containerSelector);
      addNavClick("#btnWork", "work", bodyElement, containerSelector);
      addNavClick("#btnWorkMobile", "work", bodyElement, containerSelector);
      addNavClick("#btnResearch", "research", bodyElement, containerSelector);
      addNavClick("#btnTeaching", "teaching", bodyElement, containerSelector);
      addNavClick("#btnAbout", "about", bodyElement, containerSelector);
      // Work sub-menu
      addNavClick("#btnNYCDashboard", "nyc-dashboard", bodyElement, containerSelector);
      addNavClick("#btnReportDownloadHub", "report-download-hub", bodyElement, containerSelector);
      addNavClick("#btnAdminDocRepo", "admin-doc-repo", bodyElement, containerSelector);
      addNavClick("#btnTZComp", "react-native-tzcomp", bodyElement, containerSelector);
      addNavClick("#btnWordPress", "wordpress-plugins", bodyElement, containerSelector);
      addNavClick("#btnPersonalSite", "personal-site-page", bodyElement, containerSelector);
    })
    // .then(() => {
    //   const header: HTMLElement | null = document.querySelector("#header");
    //   if (header !== null) {
    //     header.style.display = null;
    //   }
    // })
    ;
    
    function addNavClick(selector: string, view: ViewKey, bodyElement: Element | null, containerSelector?: string) {
        document.querySelector(selector)?.addEventListener("click", function(event) {
            event.preventDefault();
            loadView(view, bodyElement, containerSelector);
        });
    }
  }

export function addBtnListener(btnId: string, viewName: ViewKey, containerSelector?: string) {
  const el = document.querySelector(btnId);
  if (!el) return;
  const bodyElement = undefined;
  el.addEventListener("click", function (event) {
    event.preventDefault();
    loadView(viewName, bodyElement, containerSelector);
  });
}