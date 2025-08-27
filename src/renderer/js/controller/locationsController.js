import { displayDirectory } from "../content/content.js"
import { pushToHistory } from "../content/pagination.js"

import { openLocationModal } from "./locationModalController.js";
import { locationsModel } from "../model/locationsModel.js";
import { i18nModel } from "../model/i18nModel.js";
import { locationsView } from "../view/locationsView.js";

async function _onLocationClick(location, locDiv, e) {
    if (await window.api.fileExists(location.path)) {
        const dirContainer = locationsView.directoryContainer;
        dirContainer.innerHTML = '';
        await locationsView.renderHierarchy(location.path, dirContainer, _onDirectoryClick, async (path) => {
            return await window.api.getDirectoryHierarchy(path);
        });
        locationsModel.root = location.path;
        locationsModel.currentDirectory = location.path;
        locationsModel.activeLocation = location;
        pushToHistory({ type: 'directory', path: location.path });
        displayDirectory(location.path);
        locationsView.setActiveLocation(location.id);
    } else {
        showPopup('', i18nModel.t('dir-read-error'), 'error');
    }
}

function _onDirectoryClick(path, span, li, e) {
    pushToHistory({ type: 'directory', path });
    displayDirectory(path);
}

export async function refreshLocations() {
    locationsView.renderLocations(locationsModel.locations, _onLocationClick);
    if (locationsModel.activeLocation) {
        locationsView.setActiveLocation(locationsModel.activeLocation.id);
    }
}

export async function initLocationsController() {
    await locationsModel.getLocationsFromDB();
    refreshLocations();

    locationsView.addLocationButton.addEventListener('click', () => {
        openLocationModal();
    });
}