import { initDownloadModal, initCardOverlay } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "reportDownloadHubExe", "btnReportDownloadHubExe"),
    () => initDownloadModal('#btnDownloadConfirm', '#reportDownloadHubExe .download-option', 'reportDownloadHubExe', 'downloadConfirmModal')
];