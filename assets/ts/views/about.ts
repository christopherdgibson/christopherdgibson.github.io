import { initHrefs } from '../baseCallbacks.js';

export default [
    (containerSelector?: string) => initHrefs({containerSelector}),
    () => contactPulse()
];

function contactPulse() {
  const contactTag = document.querySelector("[data-target=contactCta]");
  if (!contactTag) return;

  contactTag.addEventListener('click', () => {
    const btnEmail: HTMLElement | null = document.querySelector('.btn-contact-email');
    const btnLinkedIn: HTMLElement | null = document.querySelector('.btn-contact-linkedin');
    const tags = [btnEmail, btnLinkedIn].filter((t): t is HTMLElement => t !== null);
    if (tags.length === 0) return;

    let timeout = 500;
    tags.forEach(tag => {
      timeout += 100;
      const addTime = timeout;
      setTimeout(() => {
        tag.classList.add('pulse-once');

        if (tag === btnEmail) {
          setTimeout(() => tag.classList.remove('pulse-once'), 300);
        } else {
          tag.addEventListener('animationend', () => {
            tag.classList.remove('pulse-once');
          }, { once: true });
        }
      }, addTime);
    });
  });
}
