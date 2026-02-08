import { historyModel } from "../model/historyModel.js";
import { locationsModel } from "../model/locationsModel.js";

import { historyView } from "../view/historyView.js";

import { filesController } from "./filesController.js";
import { locationsController } from "./locationsController.js";
import { searchController } from "./searchController.js";

export const historyController = {

    async init() {
        historyView.init();

        updateHistoryButtons();

        historyView.onPreviousClick(async () => {
            const record = historyModel.goBack();
            if (record) {
                historyView.disablePreviousButton();
                await updateFiles(record);
            }
        });

        historyView.onNextClick(async () => {
            const record = historyModel.goForward();
            if (record) {
                historyView.disableNextButton();
                await updateFiles(record);
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

async function updateFiles(record) {
    if (record.type === 'directory') { 
        searchController.restoreSearchTags([], [], []);
        locationsController.restoreLocation(record)
        await filesController.displayDirectory(record.path);
    } else if (record.type === 'search') {
        const andTags = [...record.andTags];
        const orTags = [...record.orTags];
        const notTags = [...record.notTags];
        searchController.restoreSearchTags(andTags, orTags, notTags);
        await searchController.searchFiles();
    }
    updateHistoryButtons();  
}