import { initContextMenu } from './controller/contextMenuController.js';
import { initFileTagsModal } from './controller/fileTagsModalController.js';
import { initHistory } from './controller/historyController.js';
import { initLayout } from './controller/layoutController.js';
import { initLocations } from './controller/locationsController.js';
import { initLocationsModal } from './controller/locationModalController.js';
import { initSearch } from './controller/searchController.js';
import { initSettings } from './controller/settingsController.js';
import { initTags } from './controller/tagsController.js';
import { initTagsModal } from './controller/tagsModalController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Main layout
    initLayout();

    // Header
    await initSettings();
    initSearch();

    // Left sidebar
    await initTags();
    await initLocations();

    // Modals
    initTagsModal();
    initFileTagsModal();
    initLocationsModal();

    initHistory();
    initContextMenu();
});
