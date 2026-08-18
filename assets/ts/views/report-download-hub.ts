import { initCardOverlay, initDownloadModal } from '../shared/overlays.js';

import type { ViewCallback } from '../types.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "reportDownloadHubExe", "btnReportDownloadHubExe"),
    () => initDownloadModal('#btnDownloadConfirm', '#reportDownloadHubExe .download-option', 'reportDownloadHubExe', 'downloadConfirmModal')
] satisfies ViewCallback[];
