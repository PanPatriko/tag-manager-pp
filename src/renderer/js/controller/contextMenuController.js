import { tagsModel, Tag } from "../model/tagsModel.js";
import { fileTagsModel } from "../model/fileTagsModel.js";
import { locationsModel } from '../model/locationsModel.js';
import { i18nModel } from '../model/i18nModel.js';
import { filesModel } from "../model/filesModel.js";

import { contextMenuView } from '../view/contextMenuView.js';

import { refreshTagsContainer } from "./tagsController.js";
import { openNewTagModal, openEditTagModal } from "./tagsModalController.js";
import { openFileTagsModal  } from "./fileTagsModalController.js";
import { refreshLocations } from "./locationsController.js";
import { openLocationModal } from "./locationModalController.js"

import { currentFile, setCurrentFileId } from "../state.js"
import { formatString } from "../utils.js"
import { refreshFileInfo } from "../rightSidebar/fileInfo.js"
import { updateSelectedFileCount } from "../content/filesInfo.js";
import { getSelectedFiles } from "../content/content.js"

window.editTag = editTag;
window.addChildTag = addChildTag;
window.confirmDeleteTag = confirmDeleteTag;
window.confirmDeleteFileTag = confirmDeleteFileTag;

window.addTagFile = addTagFile;
window.copyTags = copyTags;
window.pasteTags = pasteTags;
window.openFileNewTab = openFileNewTab
window.openFileExt = openFileExt;
window.openFileLocation = openFileLocation;
window.confirmDeleteFile = confirmDeleteFile;

window.editLocation = editLocation;
window.confirmDeleteLocation = confirmDeleteLocation;

export let previewWindow = null; // TODO zabrać to stąd

async function editTag(id) {
    const tag = tagsModel.findTagById(id);
    if (tag) {
        openEditTagModal(tag);
    } else {
        console.warn('Tag not found:', id);
    }
}

async function addChildTag(id) {
    const tag = tagsModel.findTagById(id);
    if (tag) {
        openNewTagModal(tag);
    } else {
        console.warn('Tag not found:', id);
    }
}

async function confirmDeleteTag(id) {
    const result = await showPopup(i18nModel.t('confirm-del-tag'), 
        'question', true);

    if (result.isConfirmed) {
        await tagsModel.deleteTag(id);
        refreshTagsContainer();
    }
}

async function addTagFile() {
    openFileTagsModal();
}

export async function copyTags(id) {
    try {
        const tags = await fileTagsModel.getFileTags(id);
        if (tags.length > 0) {
            tagsModel.copiedTags = tags;
        } else {
            showPopup(i18nModel.t('alert-file-no-tags'), 'warning');       
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
        showPopup(i18nModel.t('alert-fetching-tags'), 'warning');
    }
}

export async function pasteTags() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) {
        showPopup(i18nModel.t('alert-no-files-selected'), 'warning');
        return;
    }

    if (tagsModel.copiedTags === null || tagsModel.copiedTags.length === 0) {
        showPopup(i18nModel.t('alert-no-copied-tags'), 'warning');
        return;
    }

    const conflicts = [];

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;
        let filePath = file.dataset.path;

        if (fileId === 'null') {
            const fileName = filePath.split('\\').pop();
            await window.api.createFile({ name: fileName, path: filePath});
            const newFile = await window.api.getFileByPath(filePath);
            fileId = newFile.id;
            file.dataset.id = fileId;
            filesModel.files.find(f => f.path === filePath).id = fileId;
        }

        for (const tag of tagsModel.copiedTags) {
            try {
                await fileTagsModel.addFileTag(fileId, tag.id);
            } catch (error) {
                console.warn(`Error adding tag (${tag.id}) to file (${fileId}):`, error);
                conflicts.push({ fileId, tagId: tag.id });
            }
        }
    }

    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => `File ID: ${conflict.fileId}, Tag: ${conflict.tagId}`).join('\n');
        const text = formatString(i18nModel.t('alert-tags-paste-problems'), {
                conflictMessages: conflictMessages
        })
        showPopupTextFormat(text, 'warning');
    } else {
        showPopup(i18nModel.t('alert-tags-paste-success'), 'success');
    }

    await refreshFileInfo();
    tagsModel.copiedTags = null;
}

async function confirmDeleteFile(id) {
    if (id == null || id === 'null') {
        showPopup(i18nModel.t('cntx-menu-delete-file-no-id'), 'warning');
        return;
    }

    const result = await showPopup(i18nModel.t('confirm-del-file'),
        'question', true);

    if (result.isConfirmed) {
        await window.api.deleteFileById(id);
        filesModel.files.filter(f => f.id !== id);
        if (id === currentFile.id) {
            setCurrentFileId(null);
        }
        refreshFileInfo();
    }   
}

async function openFileExt(path) {
    window.api.openExt(path);
}

async function openFileLocation(path) {
    window.api.openExplorer(path);
}

export function openFileNewTab() {
    if (!currentFile || !currentFile.path) return;

    const fileUrl = `preview.html?file=${encodeURIComponent(currentFile.path)}`;

    // Open or reuse the preview tab
    if (previewWindow && !previewWindow.closed) {
        previewWindow.focus();
        // Send updated file info
        previewWindow.postMessage({ type: 'update-preview', file: currentFile }, '*');
    } else {
        previewWindow = window.open(fileUrl, 'filePreviewTab');
    }
}

async function confirmDeleteFileTag(id) {
    const result = await showPopup(i18nModel.t('confirm-del-tag'), 
        'question', true);

    if (result.isConfirmed) {
        await fileTagsModel.deleteFileTag(currentFile.id, id);
        refreshFileInfo();
    }
}

async function editLocation(id) {
    const location = locationsModel.findLocationById(id);
    if (location) {
        openLocationModal(location);
    } else {
        console.warn('Location not found:', id);
    }
}

async function confirmDeleteLocation(id) {
    const result = await showPopup(i18nModel.t('confirm-del-loc'), 
        'question', true);

    if (result.isConfirmed) {
        await locationsModel.deleteLocation(id);
        refreshLocations()
    }
}

function repeatCheckboxOnChange (event) {
    const vid = document.querySelector('#file-preview > *'); // TODO improve selector with file previe refactor
    vid.loop = event.target.checked;
}

function controlsCheckboxOnChange (event) {
    const vid = document.querySelector('#file-preview > *');
    vid.controls = event.target.checked;
}

export function initContextMenu() {
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
            updateSelectedFileCount();
            const fileId = fileContainer.dataset.id;
            const filePath = fileContainer.dataset.path;
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-edit-file-tags'), onClick: () => addTagFile() },
                { type: 'button', label: i18nModel.t('cntx-menu-copy-tags'), onClick: () => copyTags(fileId) },
                { type: 'button', label: i18nModel.t('cntx-menu-paste-tags'), onClick: () => pasteTags() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(filePath) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(filePath) },
                { type: 'button', label: i18nModel.t('cntx-menu-delete-file'), onClick: () => confirmDeleteFile(fileId) }
            ];
        }

        if (target.closest('.file-preview-image')) {
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(currentFile.path) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(currentFile.path) },
            ];
        }

        if (target.closest('.file-preview-video')) {
            const vid = document.querySelector('#file-preview > *');
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => openFileExt(currentFile.path) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => openFileLocation(currentFile.path) },
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
}