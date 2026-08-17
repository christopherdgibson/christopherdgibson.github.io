import { initMockHeader } from './header.js';
import { fetchFragment } from './misc.js';

interface ProjectCardProps {
  cardSelector: string;
   page?: string;
   containerSelector?: string;
}

export function populateProjectCards({cardSelector, page = "Home", containerSelector}: ProjectCardProps) {
  const projectCardsSelector = `${containerSelector ?? ''} ${cardSelector ?? ''}`;
  if (projectCardsSelector.trim() === '') return;

  const projectCards = document.querySelectorAll(projectCardsSelector);
  projectCards.forEach(card => {
    if (card === null) return;
    const href = card.getAttribute('href');
    fetchFragment(`views/work-cards/${href}-card.html`, (response) => {
        if (!response.ok) throw new Error(`View not found: ${href}`);
        return true;
      })
      .then((html) => {
        card.innerHTML = html;
      })
      .then(() => {
        if (href === 'personal-site-page') {
          const hoverId = `#btnPersonalSite${page}`;
          initMockHeader({containerSelector, sweepTextSelector:`${hoverId} .mockup-site-name span`, sweepEventSelector: hoverId, activeTab: page})
        }
      })
      .catch((err) => console.error(err));
  })
}
