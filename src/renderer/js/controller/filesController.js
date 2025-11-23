import { filesModel } from '../model/filesModel.js';

import { filesView } from '../view/filesView.js';

import { displayFiles } from '../content/content.js'; // TODO

export function initFiles() {

    filesView.onSortClick(() => {
        filesModel.changeSortOrder();
        filesView.updateSortDirectionIndicator(filesModel.sortOrder);
        displayFiles();     
    });
}
