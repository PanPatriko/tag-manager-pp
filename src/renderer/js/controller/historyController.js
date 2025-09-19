import { displayDirectory } from "../content/content.js";

import { locationsModel } from "../model/locationsModel.js";
import { historyModel } from "../model/historyModel.js";

import { historyView } from "../view/historyView.js";

import { searchFiles, restoreSearchTags } from "./searchController.js";
import { restoreLocation } from "./locationsController.js";

function updateHistoryButtons() {
    historyView.setPreviousButtonState(!historyModel.canGoBack());
    historyView.setNextButtonState(!historyModel.canGoForward());
}

function updateFiles(record) {
    if (record.type === 'directory') {
        displayDirectory(record.path);
        restoreSearchTags([], [], []);
        restoreLocation(record)
    } else if (record.type === 'search') {
        const andTags = [...record.andTags];
        const orTags = [...record.orTags];
        const notTags = [...record.notTags];
        restoreSearchTags(andTags, orTags, notTags);
        searchFiles();
    }
    updateHistoryButtons();  
}

export function pushToHistory(record) {
    if (record.type === 'directory') {
        record.root = locationsModel.root;
        record.activeLocation = locationsModel.activeLocation;
    }
    historyModel.pushToHistory(record);
    updateHistoryButtons();
}

export async function initHistory() {
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
}