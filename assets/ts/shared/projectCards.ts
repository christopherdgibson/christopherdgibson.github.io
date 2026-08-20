import { initMockHeaderAsync } from './header.js';
import { fetchFragment } from './misc.js';

interface ProjectCardProps {
  cardSelector: string;
  page?: string;
  containerSelector?: string;
  isLoadCurrent: () => boolean;
}

export async function populateProjectCardsAsync({cardSelector, page = "Home", containerSelector, isLoadCurrent}: ProjectCardProps) {
  const projectCardsSelector = `${containerSelector ?? ''} ${cardSelector ?? ''}`;
  if (projectCardsSelector.trim() === '') return;

  const projectCards = document.querySelectorAll(projectCardsSelector);
  await Promise.all(Array.from(projectCards).map(async (card) => {
    try {
      if (card === null) return;
      const href = card.getAttribute('href');
      const html = await fetchFragment({
        path: `views/work-cards/${href}-card.html`,
        validate: (response) => {
          if (!response.ok) throw new Error(`View not found: ${href}`);
          return true;
        }
      });

      if (!isLoadCurrent()) return;
      card.innerHTML = html;
      if (href === 'personal-site-page') {
        const hoverId = `#btnPersonalSite${page}`;
        await initMockHeaderAsync({containerSelector, sweepTextSelector:`${hoverId} .mockup-site-name span`, sweepEventSelector: hoverId, activeTab: page, isLoadCurrent})
      }
    } catch (err) {
      console.error(`Failed to load card:`, err);
    }
  }));
}
