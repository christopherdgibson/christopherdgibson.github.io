import { initWireframeEffect } from '../components/wireframe-render.js';
import { initCarouselFlex } from '../components/carousel-flex.js';

import type { CallbackProps, ViewCallback } from '../types.js';

export default [
    ({loadSignal}: CallbackProps) => initCarouselFlex(loadSignal),
    () => initWireframeEffect()
] satisfies ViewCallback[];
