import { addBtnListener } from '../shared/nav.js';

export default [
    (containerSelector?: string) => addBtnListener({selector: "#btnWorkAbout", view: "work", containerSelector}),
    (containerSelector?: string) => addBtnListener({selector: "#btnExperienceAbout", view: "experience", containerSelector}),
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

    let timeout = 200;
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
