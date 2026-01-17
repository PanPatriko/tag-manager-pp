import { locationsModel } from "../model/locationsModel.js";
import { historyModel } from "../model/historyModel.js";

import { historyView } from "../view/historyView.js";

import { searchController } from "./searchController.js";
import { locationsController } from "./locationsController.js";
import { filesController } from "./filesController.js";

export const historyController = {

    async init() {
        historyView.init();

        updateHistoryButtons();

        historyView.onPreviousClick(() => {
            const record = historyModel.goBack();
            if (record) {
                updateFiles(record);
            }
        });

        historyView.onNextClick(() => {
            const record = historyModel.goForward();
            if (record) {
                updateFiles(record);
            }
        });
    },

    pushToHistory(record) {
        if (record.type === 'directory') {
            record.root = locationsModel.root;
            record.activeLocation = locationsModel.activeLocation;
        }
        historyModel.pushToHistory(record);
        updateHistoryButtons();
    }
};

function updateHistoryButtons() {
    if (historyModel.canGoBack()) {
        historyView.enablePreviousButton();
    } else {
        historyView.disablePreviousButton();
    }

    if (historyModel.canGoForward()) {
        historyView.enableNextButton();
    } else {
        historyView.disableNextButton();
    }
}

function updateFiles(record) {
    if (record.type === 'directory') {
        filesController.displayDirectory(record.path);
        searchController.restoreSearchTags([], [], []);
        locationsController.restoreLocation(record)
    } else if (record.type === 'search') {
        const andTags = [...record.andTags];
        const orTags = [...record.orTags];
        const notTags = [...record.notTags];
        searchController.restoreSearchTags(andTags, orTags, notTags);
        searchController.searchFiles();
    }
    updateHistoryButtons();  
}