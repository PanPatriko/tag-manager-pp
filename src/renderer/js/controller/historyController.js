import { displayDirectory } from "../content/content.js";
import { searchFiles, displaySearchTags } from '../header/searchBar.js';

import { restoreLocation } from "./locationsController.js";
import { locationsModel } from "../model/locationsModel.js";
import { historyModel } from "../model/historyModel.js";

import { locationsView } from "../view/locationsView.js";
import { historyView } from "../view/historyView.js";

function _updateHistoryButtons() {
    historyView.prevHistoryBtn.disabled = !historyModel.canGoBack();
    historyView.nextHistoryBtn.disabled = !historyModel.canGoForward();
}

function _updateFiles(record) {
    if (record.type === 'directory') {
        displayDirectory(record.path);
        displaySearchTags([], [], []);
        restoreLocation(record)
    } else if (record.type === 'search') {
        const andTags = [...record.andTags];
        const orTags = [...record.orTags];
        const notTags = [...record.notTags];
        displaySearchTags(andTags, orTags, notTags);
        searchFiles(andTags, orTags, notTags);
    }
    _updateHistoryButtons();  
}

export function pushToHistory(record) {
    if (record.type === 'directory') {
        record.root = locationsModel.root;
        record.activeLocation = locationsModel.activeLocation;
    }
    historyModel.pushToHistory(record);
    _updateHistoryButtons();
}

export async function initHistoryController() {
    _updateHistoryButtons();

    historyView.prevHistoryBtn.addEventListener('click', () => {
        const record = historyModel.goBack();
        if (record) {
            _updateFiles(record);
        }
    });

    historyView.nextHistoryBtn.addEventListener('click', () => {
        const record = historyModel.goForward();
        if (record) {
            _updateFiles(record);
        }
    });
}