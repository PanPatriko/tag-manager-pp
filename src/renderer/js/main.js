import { showActivePanel } from './leftSidebar/leftSidebar.js';
import { restoreSidebarState } from './content/toggleSidebars.js';

import { initSettings } from './controller/settingsController.js';
import { initTags } from './controller/tagsController.js';
import { initTagsModal } from './controller/tagsModalController.js';
import { initLocations } from './controller/locationsController.js';
import { initLocationsModal } from './controller/locationModalController.js';
import { initHistory } from './controller/historyController.js';
import { initContextMenu } from './controller/contextMenuController.js';

import ('./header/searchBar.js');
import ('./contextMenu/contextMenu.js')
import ('./content/toggleSidebars.js');

document.addEventListener('DOMContentLoaded', async () => {
    
    await initSettings();

    await initTags();
    initTagsModal();

    initLocations();
    initLocationsModal();

    initHistory();
    initContextMenu();
    
    restoreSidebarState();
    showActivePanel();
});