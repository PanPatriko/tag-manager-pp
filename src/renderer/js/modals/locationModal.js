import { refreshLocations } from "../leftSidebar/locations.js";
import { i18nModel } from "../model/i18nModel.js";

const locModal = document.getElementById('location-form-modal');
const modalTitle = document.getElementById('loc-modal-title');
const nameInput = document.getElementById('loc-name');
const pathInput = document.getElementById('loc-path');
const pathBrowse = document.getElementById('loc-path-btn');
const modalOkButton = document.getElementById('loc-modal-ok');
const modalCancelButton = document.getElementById('loc-modal-cancel');

let modalLocation = null;
let isEditMode = null;

pathBrowse.addEventListener('click', async () => {
    const folderPath = await window.api.openFolderDialog();
    if (folderPath) {
        document.getElementById('loc-path').value = folderPath;
    }
});

modalOkButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const path = pathInput.value.trim();

    if (name == null || name === '') {
        showPopup(i18nModel.t('loc-alert-empty-name-title'), 
            i18nModel.t('loc-alert-empty-name'), 'warning')
        return;
    }

    if (path == null || path === '') {
        showPopup(i18nModel.t('loc-alert-empty-path-title'), 
            i18nModel.t('loc-alert-empty-path'), 'warning')
        return;
    }
    
    if (isEditMode) {
        await window.api.updateLocation(modalLocation.id, { name, path });
    } else {
        await window.api.addLocation({ name, path });      
    }

    closeModal();
    refreshLocations();
});

modalCancelButton.addEventListener('click', closeModal);

export async function openLocationModal(location = null) {
    modalLocation = location;
    if(location == null) {
        isEditMode = false;
        modalTitle.innerText = i18nModel.t('loc-add');
        nameInput.value = '';
        pathInput.value = '';
    } else {
        isEditMode = true;
        modalTitle.innerText = i18nModel.t('loc-edit');
        nameInput.value = location.name;
        pathInput.value = location.path;
    }
    locModal.classList.remove('hidden');
}

function closeModal() {
    locModal.classList.add('hidden');
    nameInput.value = '';
    pathInput.value = '';
}