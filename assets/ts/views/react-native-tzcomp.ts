import { initCardOverlay, initDownloadModal } from '../shared/overlays.js';

import type { ViewCallback } from '../types.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "tzCompApk", "btnTZCompApk"),
    () => initDownloadModal('#btnDownloadConfirm', '#tzCompApk .download-option[data-platform=Android]', 'tzCompApk', 'downloadConfirmModal')
] satisfies ViewCallback[];
