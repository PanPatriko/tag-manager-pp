import { filesModel } from "../model/filesModel.js";
import { fileTagsModel } from "../model/fileTagsModel.js";
import { i18nModel } from '../model/i18nModel.js';
import { locationsModel } from '../model/locationsModel.js';
import { tagsModel } from "../model/tagsModel.js";

import { contextMenuView } from '../view/contextMenuView.js';
import { filesView } from "../view/filesView.js";

import { filePreviewController } from "./filePreviewController.js";
import { fileTagsModalController } from "./fileTagsModalController.js";
import { locationModalController } from "./locationModalController.js"
import { locationsController } from "./locationsController.js";
import { paginationController } from "./paginationController.js";
import { tagsController } from "./tagsController.js";
import { tagsModalController } from "./tagsModalController.js";

export let previewWindow = null; // TODO zabrać to stąd

export const contextMenuController = {

    init() {

        window.editTag = editTag;
        window.addChildTag = addChildTag;
        window.confirmDeleteTag = confirmDeleteTag;
        window.confirmDeleteFileTag = confirmDeleteFileTag;

        window.addTagFile = addTagFile;
        window.copyTags = this.copyTags;
        window.pasteTags = this.pasteTags;
        window.openFileNewTab = this.openFileNewTab
        window.openFileExt = this.openFileExt;
        window.openFileLocation = this.openFileLocation;
        window.confirmDeleteFile = this.confirmDeleteFile;

        window.editLocation = editLocation;
        window.confirmDeleteLocation = confirmDeleteLocation;

        document.addEventListener('contextmenu', (event) => {
            const target = event.target;
            const id = parseInt(target.dataset.id);
            let items = [];

            if (target.closest('.tag-item')) {
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-edit-tag'), onClick: () => editTag(id) },
                    { type: 'button', label: i18nModel.t('cntx-menu-add-child-tag'), onClick: () => addChildTag(id) },
                    { type: 'button', label: i18nModel.t('cntx-menu-del-tag'), onClick: () => confirmDeleteTag(id) }
                ];
            }

            if (target.closest('.file-tag-item')) {
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-edit-tag'), onClick: () => editTag(id) },
                    { type: 'button', label: i18nModel.t('cntx-menu-del-file-tag'), onClick: () => confirmDeleteFileTag(id) }
                ];
            }

            if (target.closest('.loc-item')) {
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-edit-loc'), onClick: () => editLocation(id) },
                    { type: 'button', label: i18nModel.t('cntx-menu-del-loc'), onClick: () => confirmDeleteLocation(id) }
                ];
            }

            const fileContainer = event.target.closest('.file-container');
            if (fileContainer) {
                fileContainer.setAttribute('data-checked', true);
                paginationController.updateSelectedFileCount();
                const fileId = fileContainer.dataset.id;
                const filePath = fileContainer.dataset.path;
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-edit-file-tags'), onClick: () => addTagFile() },
                    { type: 'button', label: i18nModel.t('cntx-menu-copy-tags'), onClick: () => copyTags(fileId) },
                    { type: 'button', label: i18nModel.t('cntx-menu-paste-tags'), onClick: () => pasteTags() },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(filePath) },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(filePath) },
                    { type: 'button', label: i18nModel.t('cntx-menu-delete-file'), onClick: () => confirmDeleteFile() }
                ];
            }

            if (target.closest('.file-preview-image')) {
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(filesModel.currentPreviewFile.path) },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(filesModel.currentPreviewFile.path) },
                ];
            }

            if (target.closest('.file-preview-video')) {
                const vid = document.querySelector('#file-preview > *');
                items = [
                    { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(filesModel.currentPreviewFile.path) },
                    { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(filesModel.currentPreviewFile.path) },
                    { type: 'checkbox', label: i18nModel.t('cntx-menu-vid-repeat'), checked: vid.loop, onchange: repeatCheckboxOnChange },
                    { type: 'checkbox', label: i18nModel.t('cntx-menu-vid-show-controls'), checked: vid.controls, onchange: controlsCheckboxOnChange }
                ];
            }

            if (items.length > 0) {
                event.preventDefault();
                contextMenuView.showMenu(event.pageX, event.pageY, items);
            }
        });
        document.addEventListener('click', contextMenuView.hideMenu);
    },

    async copyTags(id) {
        try {
            const tags = await fileTagsModel.getFileTags(id);
            if (tags.length > 0) {
                tagsModel.copiedTags = tags;
            } else {
                showPopup(i18nModel.t('alert-file-no-tags'), 'warning');
            }
        } catch (error) {
            console.error('copyTags: Error fetching tags:', error);
            showPopup(i18nModel.t('alert-fetching-tags'), 'warning');
        }
    },

    async pasteTags() {
        const selectedFiles = filesModel.getSelectedFiles();

        if (selectedFiles.length === 0) {
            showPopup(i18nModel.t('alert-no-files-selected'), 'warning');
            return;
        }

        if (tagsModel.copiedTags === null || tagsModel.copiedTags.length === 0) {
            showPopup(i18nModel.t('alert-no-copied-tags'), 'warning');
            return;
        }

        for (const file of selectedFiles) {
            let fileId = file.id;
            let filePath = file.path;

            if (fileId === 'null' || !fileId) {
                const createdFile = await filesModel.createFile(filePath);
                filesView.addIdToContainer(createdFile);
                fileId = createdFile.id;
            }

            for (const tag of tagsModel.copiedTags) {
                try {
                    await fileTagsModel.addFileTag(fileId, tag.id);
                } catch (error) {
                    console.error('pasteTags: error addFileTag',error);
                }
            }
        }

        await filePreviewController.renderFileInfo(filesModel.currentPreviewFile);
    },

    async confirmDeleteFile() {
        const result = await showPopup(i18nModel.t('confirm-del-file'),
            'question', true);

        if (result.isConfirmed) {
            const selectedFiles = filesModel.getSelectedFiles();

            for (const file of selectedFiles) {
                if (file.id === 'null' || !file.id) continue;
                filesView.removeIdFromContainer(file.id);
                await filesModel.deleteFile(file.id);
            }
            await filePreviewController.renderFileInfo(filesModel.currentPreviewFile);
        }
    },

    async openFileExt(path) {
        window.api.openExt(path);
    },

    async openFileLocation(path) {
        window.api.openExplorer(path);
    },

    openFileNewTab() {
        if (!filesModel.currentPreviewFile) return;

        const fileUrl = `preview.html?file=${encodeURIComponent(filesModel.currentPreviewFile.path)}`;

        // Open or reuse the preview tab
        if (previewWindow && !previewWindow.closed) {
            previewWindow.focus();
            // Send updated file info
            previewWindow.postMessage({ type: 'update-preview', file: filesModel.currentPreviewFile }, '*');
        } else {
            previewWindow = window.open(fileUrl, 'filePreviewTab');
        }
    },
}

async function editTag(id) {
    const tag = tagsModel.findTagById(id);
    if (tag) {
        tagsModalController.openEditTagModal(tag);
    } else {
        console.warn('Tag not found:', id);
    }
}

async function addChildTag(id) {
    const tag = tagsModel.findTagById(id);
    if (tag) {
        tagsModalController.openNewTagModal(tag);
    } else {
        console.warn('Tag not found:', id);
    }
}

async function confirmDeleteTag(id) {
    const result = await showPopup(i18nModel.t('confirm-del-tag'),
        'question', true);

    if (result.isConfirmed) {
        await tagsModel.deleteTag(id);
        tagsController.refreshTagsContainer();
    }
}

async function addTagFile() {
    fileTagsModalController.openFileTagsModal();
}

async function confirmDeleteFileTag(id) {
    const result = await showPopup(i18nModel.t('confirm-del-tag'),
        'question', true);

    if (result.isConfirmed) {
        await fileTagsModel.deleteFileTag(filesModel.currentPreviewFile.id, id);
        await filePreviewController.renderFileInfo(filesModel.currentPreviewFile);
    }
}

async function editLocation(id) {
    const location = locationsModel.findLocationById(id);
    if (location) {
        locationModalController.openLocationModal(location);
    } else {
        console.warn('Location not found:', id);
    }
}

async function confirmDeleteLocation(id) {
    const result = await showPopup(i18nModel.t('confirm-del-loc'),
        'question', true);

    if (result.isConfirmed) {
        await locationsModel.deleteLocation(id);
        locationsController.refreshLocations()
    }
}

function repeatCheckboxOnChange(event) {
    const vid = document.querySelector('#file-preview > *'); // TODO selectors should be in the view
    vid.loop = event.target.checked;
}

function controlsCheckboxOnChange(event) {
    const vid = document.querySelector('#file-preview > *');
    vid.controls = event.target.checked;
}
