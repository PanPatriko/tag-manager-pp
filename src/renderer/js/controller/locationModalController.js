import { locationModalView } from "../view/locationModalView.js";
import { i18nModel } from "../model/i18nModel.js";
import { modalModel, ModalMode } from "../model/modalModel.js";
import { refreshLocations } from "./locationsController.js";
import { locationsModel } from "../model/locationsModel.js";

function _closeModal() {
    locationModalView.locationModal.classList.add('hidden');
    locationModalView.nameInput.value = '';
    locationModalView.pathInput.value = '';
}

async function _saveLocation() {
    const name = locationModalView.nameInput.value.trim();
    const path = locationModalView.pathInput.value.trim();

    if (name == null || name === '') {
        showPopup('', i18nModel.t('loc-alert-empty-name'), 'warning')
        return;
    }

    if (path == null || path === '') {
        showPopup('', i18nModel.t('loc-alert-empty-path'), 'warning')
        return;
    }

    if (modalModel.modalMode === ModalMode.NEW && locationsModel.locations.find(loc => loc.path === path)) {
        showPopup('', i18nModel.t('loc-alert-duplicate-path'), 'warning')
        return;
    }
    
    if (modalModel.modalMode === ModalMode.EDIT) {
        await locationsModel.updateLocation(modalModel.locationToEdit.id, { name, path });
    } else if (modalModel.modalMode === ModalMode.NEW) {
        await locationsModel.addLocation({ name, path });    
    } else {
        console.error('Unknown modal mode:', modalModel.modalMode);
    }

    _closeModal();
    refreshLocations();
}

async function _openFolderDialog() { 
    const folderPath = await window.api.openFolderDialog();
    if (folderPath) {
        locationModalView.pathInput.value = folderPath;
    }
}

export function initLocationsModal() {
    locationModalView.pathBrowseButton.addEventListener('click', _openFolderDialog);
    locationModalView.cancelButton.addEventListener('click', _closeModal);
    locationModalView.okButton.addEventListener('click', _saveLocation);
}

export async function openLocationModal(location = null) {
    modalModel.locationToEdit = location;
    if(location == null) {
        modalModel.modalMode = ModalMode.NEW;
        locationModalView.modalTitle.innerText = i18nModel.t('loc-add');
        locationModalView.nameInput.value = '';
        locationModalView.pathInput.value = '';
    } else {
        modalModel.modalMode = ModalMode.EDIT;
        locationModalView.modalTitle.innerText = i18nModel.t('loc-edit');
        locationModalView.nameInput.value = location.name;
        locationModalView.pathInput.value = location.path;
    }
    locationModalView.locationModal.classList.remove('hidden');
}