import { initMockHeaderAsync } from './header.js';
import { fetchFragment } from './misc.js';

interface ProjectCardProps {
  cardSelector: string;
  page?: string;
  containerSelector?: string;
  loadSignal: AbortSignal;
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

      if (loadSignal.aborted) return;
      
      card.innerHTML = html;
      if (href === 'personal-site-page') {
        const hoverId = `#btnPersonalSite${page}`;
        await initMockHeaderAsync({containerSelector, sweepTextSelector:`${hoverId} .mockup-site-name span`, sweepEventSelector: hoverId, activeTab: page, loadSignal})
      }
    } catch (err) {
      console.error(`Failed to load card:`, err);
    }
  }));
}
