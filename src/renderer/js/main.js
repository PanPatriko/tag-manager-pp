import { contextMenuController } from './controller/contextMenuController.js';
import { filePreviewController } from './controller/filePreviewController.js';
import { filesController } from './controller/filesController.js';
import { fileTagsModalController } from './controller/fileTagsModalController.js';
import { historyController } from './controller/historyController.js';
import { keyboardController } from './controller/keyboardController.js';
import { layoutController } from './controller/layoutController.js';
import { locationModalController } from './controller/locationModalController.js';
import { locationsController } from './controller/locationsController.js';
import { paginationController } from './controller/paginationController.js';
import { searchController } from './controller/searchController.js';
import { settingsController } from './controller/settingsController.js';
import { tagsController } from './controller/tagsController.js';
import { tagsModalController } from './controller/tagsModalController.js';


document.addEventListener('DOMContentLoaded', async () => {
    // Main layout
    layoutController.init();

    // Content area
    paginationController.init();
    filesController.init();

    // Header
    await settingsController.init();
    searchController.init();

    // Left sidebar
    await tagsController.init();
    await locationsController.init();

    // Right sidebar
    filePreviewController.init();

    // Modals
    tagsModalController.init();
    fileTagsModalController.init();
    locationModalController.init();

    historyController.init();
    contextMenuController.init();
    keyboardController.init();
});
