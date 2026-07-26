import { initHeaderSweep } from './headerSweep.js';
import { fetchFragment } from './misc.js';
import loadView from '../router.js'

import type { ViewKey } from '../types.js';

type NavMenuProps = {
  navSelector: string;
  navHtml: string;
  bodyElement?: Element | null;
  containerSelector?: string;
}

interface BtnClickProps {
  selector: string;
  view: ViewKey;
  containerSelector?: string;
}

interface NavClickProps extends BtnClickProps {
  bodyElement: Element | null;
}

/* ────────── Load navbar and menu events ────────── */

export function initNavMenu({navSelector, navHtml, bodyElement = document.querySelector("#body-placeholder"), containerSelector}: NavMenuProps) {
  const navMenu = document.querySelector(navSelector);
  if (navMenu === null) return;
  fetchFragment(`${navHtml}.html`)
    .then((data) => {
      navMenu.innerHTML = data;
      initHeaderSweep();
      addNavClick({selector: "#btnHome", view: "home", bodyElement, containerSelector});
      addNavClick({selector: "#btnExperience", view: "experience", bodyElement, containerSelector});
      addNavClick({selector: "#btnWork", view: "work", bodyElement, containerSelector});
      addNavClick({selector: "#btnWorkMobile", view: "work", bodyElement, containerSelector});
      addNavClick({selector: "#btnResearch", view: "research", bodyElement, containerSelector});
      addNavClick({selector: "#btnTeaching", view: "teaching", bodyElement, containerSelector});
      addNavClick({selector: "#btnAbout", view: "about", bodyElement, containerSelector});
      // Work sub-menu
      addNavClick({selector: "#btnNYCDashboard", view: "nyc-dashboard", bodyElement, containerSelector});
      addNavClick({selector: "#btnReportDownloadHub", view: "report-download-hub", bodyElement, containerSelector});
      addNavClick({selector: "#btnAdminDocRepo", view: "admin-doc-repo", bodyElement, containerSelector});
      addNavClick({selector: "#btnTZComp", view: "react-native-tzcomp", bodyElement, containerSelector});
      addNavClick({selector: "#btnWordPress", view: "wordpress-plugins", bodyElement, containerSelector});
      addNavClick({selector: "#btnPersonalSite", view: "personal-site-page", bodyElement, containerSelector});
    })
    .then(() => {
      const header: HTMLElement | null = document.querySelector("#header");
      if (header !== null) {
        header.style.display = null;
      }
    })
    ;
    
    function addNavClick({selector, view, bodyElement, containerSelector}: NavClickProps) {
    document.querySelector(selector)?.addEventListener("click", function(event) {
      event.preventDefault();
      loadView({view, bodyElement, containerSelector});
    });
  }
}

export function ensureNavMenu({navSelector = '#nav-placeholder', navHtml = 'nav', bodyElement, containerSelector}: NavMenuProps) {
  const navPlaceholder = document.querySelector(navSelector);
  if (navPlaceholder && navPlaceholder.childElementCount === 0) {
    initNavMenu({navSelector: '#nav-placeholder', navHtml, bodyElement, containerSelector});
  }
}

export function addBtnListener({selector, view, containerSelector}: BtnClickProps) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener("click", function (event) {
    event.preventDefault();
    loadView({view, bodyElement: undefined, containerSelector});
  });
}
