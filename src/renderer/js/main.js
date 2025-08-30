import { showActivePanel } from './leftSidebar/leftSidebar.js';
import { restoreSidebarState } from './content/toggleSidebars.js';

import { initSettingsController } from './controller/settingsController.js';
import { initTagsController } from './controller/tagsController.js';
import { initTagsModalController } from './controller/tagsModalController.js';
import { initLocationsController } from './controller/locationsController.js';
import { initLocationModalController } from './controller/locationModalController.js';
import { initHistoryController } from './controller/historyController.js';

import ('./header/searchBar.js');
import ('./contextMenu/contextMenu.js')
import ('./content/toggleSidebars.js');

document.addEventListener('DOMContentLoaded', async () => {
    
    await initSettingsController();

    await initTagsController();
    initTagsModalController();

    initLocationsController();
    initLocationModalController();

    initHistoryController();
    
    restoreSidebarState();
    showActivePanel();
});