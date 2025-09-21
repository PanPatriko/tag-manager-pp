import { locationModalView } from "../view/locationModalView.js";
import { i18nModel } from "../model/i18nModel.js";
import { modalModel, ModalMode, LocationModalState } from "../model/modalModel.js";
import { refreshLocations } from "./locationsController.js";
import { locationsModel } from "../model/locationsModel.js";

function closeModal() {
    modalModel.locationToEdit = null;
    locationModalView.closeModal();
}

async function saveLocation() {
    const name = locationModalView.getNameValue();
    const path = locationModalView.getPathValue();

    if (name == null || name === '') {
        showPopup(i18nModel.t('loc-alert-empty-name'), 'warning')
        return;
    }

    if (path == null || path === '') {
        showPopup(i18nModel.t('loc-alert-empty-path'), 'warning')
        return;
    }

    if (modalModel.modalMode === ModalMode.NEW && locationsModel.findLocationByPath(path)) {
        showPopup(i18nModel.t('loc-alert-duplicate-path'), 'warning')
        return;
    }
    
    if (modalModel.modalMode === ModalMode.EDIT) {
        await locationsModel.updateLocation({id: modalModel.locationToEdit.id, name, path });
    } else if (modalModel.modalMode === ModalMode.NEW) {
        await locationsModel.addLocation({ name, path });    
    } else {
        console.error('Unknown modal mode:', modalModel.modalMode);
    }

    closeModal();
    refreshLocations();
}

async function openFolderDialog() { 
    const folderPath = await window.api.openFolderDialog();
    if (folderPath) {
        locationModalView.setPathValue(folderPath);
    }
}

export function initLocationsModal() {
    locationModalView.onBrowseClick(openFolderDialog);
    locationModalView.onCancelClick(closeModal);
    locationModalView.onOkClick(saveLocation);
}

export async function openLocationModal(location = null) {
    let title, name, path;
    modalModel.locationToEdit = location;
    
    if(location == null) {
        modalModel.modalMode = ModalMode.NEW;
        title = i18nModel.t('loc-add');
        name = '';
        path = '';
    } else {
        modalModel.modalMode = ModalMode.EDIT;
        title = i18nModel.t('loc-edit');
        name = location.name;
        path = location.path;
    }

    const locationModalState = new LocationModalState({ title, name, path });
    locationModalView.openModal(locationModalState);
}