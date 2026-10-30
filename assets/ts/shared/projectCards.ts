import { fetchFragment } from './asyncFetch.js';
import { initMockHeaderAsync } from './header.js';
import { VIEW_KEYS_WORK, type CreateHTMLProps, ProjectKey } from '../types.js';

interface ProjectCardProps {
  cardSelector: string;
  page?: string;
  containerSelector?: string;
  loadSignal: AbortSignal;
}

interface ProjectRow {
  dataStack: string;
  title: string;
  techStack: string;
  btnId?: string;
}

export const PROJECT_CARD_DETAILS: Record<ProjectKey, ProjectRow> = {
  "demand-dashboard": {
    dataStack: "[css, githubActions, html, python, react, ts, vite]",
    title: "Demand Dashboard",
    techStack: "Python · React · Typescript"
  },
  "duopoly-dashboard": {
    dataStack: "[css, githubActions, html, python, react, ts, vite]",
    title: "Duopoly Dashboard",
    techStack: "Python · React · Typescript"
  },
  "nyc-dashboard": {
    dataStack: "[blazor, cSharp, css, githubActions, html, ts]",
    title: "NYC Dashboard",
    techStack: "C# · Blazor WebAssembly · Open API"
  },
  "report-download-hub": {
    dataStack: "[avalonia, cSharp, php, ts, xaml]",
    title: "Report Download Hub",
    techStack: "C# · Avalonia · Selenium"
  },
  "admin-doc-repo": {
    dataStack: "[apache, html, php, react, sql, ts]",
    title: "Admin Doc Repo",
    techStack: "React · PHP · REST API"
  },
  "react-native-tzcomp": {
    dataStack: "[css, githubActions, html, native, react, ts]",
    title: "Timezone Comparison",
    techStack: "React Native · Typescript · Expo"
  },
  "wordpress-plugins": {
    dataStack: "[apache, html, php, react, sql, ts]",
    title: "WordPress Plugins",
    techStack: "React · Typescript · WordPress"
  },
  "wireframe-effect": {
    dataStack: "[css, githubActions, html, node, ts, vite]",
    title: "Wireframe Effect",
    techStack: "Typescript · Sobel Edges"
  },
  "personal-site-page": {
    dataStack: "[css, githubActions, html, node, ts, vite]",
    title: "This Site",
    techStack: "Vanilla JS · CSS · HTML",
    btnId: 'btnPersonalSiteCard'
  }
}

export function createProjectCards({selector, className, containerSelector}: CreateHTMLProps) {
  const projectsSelector = `${containerSelector ?? ''} ${selector ?? ''}`;
  if (projectsSelector.trim() === '') return;

  const projects = document.querySelector(projectsSelector);
  if (projects === null) return;

  projects.replaceChildren(
    ...VIEW_KEYS_WORK.map((key) => projectCard(key, className))
  );
}

function projectCard(key: ProjectKey, className?: string): HTMLElement {
  const atag = document.createElement('a');
  atag.href = key;
  if (className){
    atag.classList.add(className);
  }
  if (PROJECT_CARD_DETAILS[key].btnId) {
    atag.id = PROJECT_CARD_DETAILS[key].btnId;
  }

  return atag;
}

export async function populateProjectCardsAsync({cardSelector, page = "Home", containerSelector, loadSignal}: ProjectCardProps) {
  const projectCardsSelector = `${containerSelector ?? ''} ${cardSelector ?? ''}`;
  if (projectCardsSelector.trim() === '') return;
  
  const projectCards = document.querySelectorAll(projectCardsSelector);
  await Promise.all(Array.from(projectCards).map(async (card) => {
    try {
      if (card === null) return;
      const href = card.getAttribute('href');
      const html = await fetchFragment({
        path: `views/work-cards/${href}-card.html`,
        signal: loadSignal,
        validate: (response) => {
          if (!response.ok) throw new Error(`View not found: ${href}`);
          return true;
        }
      });

      if (html === null) return;
      
      card.innerHTML = html;
      
      if (href === 'personal-site-page') {
        const hoverId = `#btnPersonalSiteCard`; //TODO: check if minisite conflicts
        await initMockHeaderAsync({containerSelector, sweepTextSelector:`${hoverId} .mockup-site-name span`, sweepEventSelector: hoverId, activeTab: page, loadSignal})
      }
    } catch (error) {
      console.error(`Failed to load card:`, error);
    }
  }));
}
