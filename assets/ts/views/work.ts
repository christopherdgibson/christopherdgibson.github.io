import { sweepSpanBilateral } from '../shared/header.js';
import { populateProjectCardsAsync } from '../shared/projectCards.js';

import type { CallbackProps, ViewCallback } from '../types.js';

export default [
  () => sweepSpanBilateral(".name-char"),
  ({containerSelector}: CallbackProps) => populateProjectCardsAsync({ cardSelector: '.project-grid a', page: "Work", containerSelector }),
] satisfies ViewCallback[];