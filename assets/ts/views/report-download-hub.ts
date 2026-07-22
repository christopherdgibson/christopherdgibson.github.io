import { initDownloadModal, initCardOverlay } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "reportDownloadHubExe", "btnReportDownloadHubExe"),
    () => initDownloadModal()
];