import { initMockHeaderAsync } from '../../shared/header.js';

import type { CallbackProps, ViewCallback } from '../../types.js';

export default [
    ({containerSelector, loadSignal}: CallbackProps) => initMockHeaderAsync({containerSelector, sweepTextSelector: ".diagram-block .mockup-site-name span", sweepEventSelector: ".diagram-block", activeTab: "Thoughts", loadSignal})
] satisfies ViewCallback[];
