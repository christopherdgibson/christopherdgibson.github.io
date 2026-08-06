import { initMockHeader } from './header.js';
import { addBtnListener } from './nav.js';
import { fetchFragment } from './misc.js';

import type { ViewKey } from '../types.js';

type ProjectEntry = {
  id: string;
  view: ViewKey;
  callback?: (hoverId: string, activeTab: string, containerSelector?: string) => void;
};

const projects: Array<ProjectEntry> = [
  {id: 'btnNYCDashboard', view: 'nyc-dashboard'},
  {id: 'btnReportDownloadHub', view: 'report-download-hub'},
  {id: 'btnAdminDocRepo', view: 'admin-doc-repo'},
  {id: 'btnTZComp', view: 'react-native-tzcomp'},
  {id: 'btnWordPress', view: 'wordpress-plugins'},
  {id: 'btnPersonalSite', view: 'personal-site-page', callback: (hoverId: string, activeTab, containerSelector?: string) => initMockHeader({containerSelector, textSelector:`${hoverId} .mockup-site-name span`, eventSelector: hoverId, activeTab})},
];

export function populateProjectCards(page = "Home", containerSelector?: string) {
  const hoverId = `#btnPersonalSite${page}`;

  projects.forEach(project => {
    const view = project.view;
    const projectId = `#${project.id}${page}`;
    const card = document.querySelector(projectId);

    if (card === null) return;
    fetchFragment(`views/work-cards/${view}-card.html`, (response) => {
        if (!response.ok) throw new Error(`View not found: ${view}`);
        return true;
      })
      .then((html) => {
        card.innerHTML = html;
      })
      .then(() => {
        if (project.callback) {
          project.callback(hoverId, page, containerSelector);
        }
      })
      .catch((err) => console.error(err));
      addBtnListener({selector: projectId, view, containerSelector});
  })
}

export function addHomeTableBtns(containerSelector?: string) {
    projects.forEach(project => {
    const view = project.view;
    const tableId = `#${project.id}Table`;
    addBtnListener({selector: tableId, view, containerSelector});
  })
}
