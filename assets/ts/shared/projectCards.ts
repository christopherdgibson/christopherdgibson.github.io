import { initHoverSweep } from './headerSweep.js';
import { addBtnListener } from './nav.js';

import type { ViewKey } from '../types.js';


type ProjectEntry = {
  id: string;
  viewName: ViewKey;
  callback?: (hoverId: string) => void;
};

const projects: Array<ProjectEntry> = [
  {id: 'btnNYCDashboard', viewName: 'nyc-dashboard'},
  {id: 'btnReportDownloadHub', viewName: 'report-download-hub'},
  {id: 'btnAdminDocRepo', viewName: 'admin-doc-repo'},
  {id: 'btnTZComp', viewName: 'react-native-tzcomp'},
  {id: 'btnWordPress', viewName: 'wordpress-plugins'},
  {id: 'btnPersonalSite', viewName: 'personal-site-page', callback: (hoverId: string) => initHoverSweep(`${hoverId} .mockup-site-name span`, hoverId)},
];

export function populateProjectCards(page = "Home", containerSelector?: string) {
  const hoverId = `#btnPersonalSite${page}`;

  projects.forEach(project => {
    const viewName = project.viewName;
    const projectId = `#${project.id}${page}`;
    const card = document.querySelector(projectId);
    if (card === null) return;
    fetch(`views/work-cards/${viewName}-card.html`)
      .then((response) => {
        if (!response.ok) throw new Error(`View not found: ${viewName}`);
        return response.text();
      })
      .then((html) => {
        card.innerHTML = html;
      })
      .then(() => {
        if (project.callback) {
          project.callback(hoverId);
        }
      })
      .catch((err) => console.error(err));
      addBtnListener(projectId, viewName, containerSelector);
  })
}

export function addHomeTableBtns(containerSelector?: string) {
    projects.forEach(project => {
    const viewName = project.viewName;
    const tableId = `#${project.id}Table`;
    addBtnListener(tableId, viewName, containerSelector);
  })
}