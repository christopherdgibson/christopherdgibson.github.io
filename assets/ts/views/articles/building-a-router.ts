import { initMockHeaderAsync } from '../../shared/header.js';

import type { CallbackProps, ViewCallback } from '../../types.js';

export default [
    ({containerSelector, isLoadCurrent}: CallbackProps) => initMockHeaderAsync({containerSelector, sweepTextSelector: ".diagram-block .mockup-site-name span", sweepEventSelector: ".diagram-block", activeTab: "Thoughts", isLoadCurrent})
] satisfies ViewCallback[];
