import { sweepSpanBilateral } from '../shared/header.js';
import { createProjectCards, populateProjectCardsAsync } from '../shared/projectCards.js';
import type { CallbackProps, ViewCallback } from '../types.js';

export default [
  () => sweepSpanBilateral(".name-char"),
  ({containerSelector}: CallbackProps) => createProjectCards({selector: '.project-grid', containerSelector}),
  ({containerSelector, loadSignal}: CallbackProps) => populateProjectCardsAsync({ cardSelector: '.project-grid a', page: "Work", containerSelector, loadSignal }),
] satisfies ViewCallback[];
