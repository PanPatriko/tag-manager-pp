import { filesModel } from "../model/filesModel.js";
import { tagsModel, TagType } from '../model/tagsModel.js';
import { fileTagsModel } from '../model/fileTagsModel.js';
import { i18nModel } from "../model/i18nModel.js";

import { tagsView, TagClass } from "../view/tagsView.js";

import { displayFiles } from "../controller/filesController.js";

const showFileInfoButton = document.getElementById('show-file-info');
const fileInfoSection = document.getElementById('file-info');

const showFileTagsButton = document.getElementById('show-file-tags');

const showFilePrevButton = document.getElementById('show-file-prev');
const preview = document.getElementById('file-preview');

const fileIdSpan = document.getElementById('file-id');
const filePathInput = document.getElementById('file-path');
const fileNameInput = document.getElementById('file-name');
const fileNameSaveButton = document.getElementById('file-name-save');

const fileTagsTree = document.getElementById('file-tags-container');
const resizeHandle = document.getElementById('file-container-resize-handle');

let isResizing = false;
let isMouseOverSaveButton = false;

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = fileTagsTree.parentElement.getBoundingClientRect();
    let newWidth = e.clientX - containerRect.left;
    fileTagsTree.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
    }
});

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
});

fileNameSaveButton.addEventListener('mouseenter', () => {
    isMouseOverSaveButton = true;
});

fileNameSaveButton.addEventListener('mouseleave', () => {
    isMouseOverSaveButton = false;
});

showFileInfoButton.addEventListener('click', function() {
    fileInfoSection.classList.toggle('hidden');
    showFileInfoButton.classList.toggle('active');
});

showFilePrevButton.addEventListener('click', function() {
    preview.classList.toggle('hidden');
    showFilePrevButton.classList.toggle('active');
    if (preview.classList.contains('hidden')) {
        fileTagsTree.style.width = '100%';
        const videos = document.querySelectorAll('.file-preview-video');
        videos.forEach(video => {
            video.pause();
        });
    } else {
        fileTagsTree.style.width = '250px';
    }
    updateResizeHandleVisibility();
});

showFileTagsButton.addEventListener('click', function() {
    fileTagsTree.classList.toggle('hidden');
    showFileTagsButton.classList.toggle('active');
    updateResizeHandleVisibility();
});

function updateResizeHandleVisibility() {
    if (!preview.classList.contains('hidden') && !fileTagsTree.classList.contains('hidden')) {
        resizeHandle.classList.remove('hidden');
    } else {
        resizeHandle.classList.add('hidden');
    }
}

fileNameInput.addEventListener('focus', async () => {
    if (await window.api.fileExists(filesModel.currentPreviewFile.path)) {
        fileNameSaveButton.hidden = false;
    } else {
        // TODO Set new path for file
    }
});

fileNameInput.addEventListener('focusout', () => {
    if (!isMouseOverSaveButton) {
        fileNameSaveButton.hidden = true;
    }
});

fileNameSaveButton.addEventListener('click', async () => {
    if (!filesModel.currentPreviewFile) {
        return;
    }
    
    const newFileName = fileNameInput.value;
    const fileId = filesModel.currentPreviewFile.id;
    const oldFilePath = filesModel.currentPreviewFile.path;

    try {
        if(fileId != null) { 
            const result = await window.api.updateFile(fileId, newFileName, oldFilePath);
            if (result.success) {
                refreshFileInfo();              
                fileNameSaveButton.hidden = true;
                const file = filesModel.files.find(file => file.id === fileId);
                if (file) {
                    file.name = newFileName;
                    file.path = result.newFilePath;
                }
                displayFiles();
            } else {
                showPopup(i18nModel.t('file-prev-name-save-error') + result.error, 'error');
            }
        } else {
            const result = await window.api.updateFileNotDB(newFileName, oldFilePath);
            if (result.success) {
                filePathInput.value = result.newFilePath;
                fileNameSaveButton.hidden = true;
                const file = filesModel.files.find(file => file.name === filesModel.currentPreviewFile.name);
                if (file) {
                    file.name = newFileName;
                    file.path = result.newFilePath;
                }
                displayFiles();
            } else {
                showPopup(i18nModel.t('file-prev-name-save-error') + error, 'error');
            }
        }      
    } catch (error) {
        showPopup(i18nModel.t('file-prev-name-save-error') + error, 'error');
    }
});

export async function refreshFileInfo() {
    if (filesModel.currentPreviewFile) {
        filesModel.currentPreviewFile = await fetchFileInfo(filesModel.currentPreviewFile);
        await renderFileInfo(filesModel.currentPreviewFile);
    }
}

export async function renderFileInfo(file) {
    fileTagsTree.innerHTML = "";
    fileTagsTree.dataset.i18n = "file-prev-no-tags";
    fileIdSpan.dataset.i18n = "file-prev-no-ID";

    if(file) {  
        fileIdSpan.textContent = file.id ?? i18nModel.t('file-prev-no-ID');
        fileIdSpan.dataset.i18n = file.id ? null : "file-prev-no-ID";

        fileNameInput.value = file.name || "";
        filePathInput.value = file.path || "";

        const tags = await fileTagsModel.getFileTags(file.id);
        if (!tags || tags.length === 0) {
            fileTagsTree.textContent = i18nModel.t('file-prev-no-tags');
        } else {
            const completeTags = tagsModel.addMissingParentTags(tags);
            const tagHierarchy = tagsModel.buildTagHierarchy(completeTags);
            tagsView.renderTagTree({
                container: tagsView.getFileTagsContainer(),
                tagHierarchy,
                tagClass: TagClass.FILE_TAG_ITEM,
                childrenInitiallyVisible: false
            });            
            tagsView.applyExpandedTags(tagsModel.getExpandedTags(TagType.EXPANDED_FILE_TAGS), TagClass.FILE_TAG_ITEM);
        }
    } else {
        fileIdSpan.textContent = i18nModel.t('file-prev-no-ID');
        fileNameInput.value = "";
        filePathInput.value = "";
        const preview = document.getElementById('file-preview');
        preview.innerHTML = ''; 
    }
}

async function fetchFileInfo(file) {
    if (!file) return null;

    if (file.id == null) {
        return await window.api.getFileByPath(file.path);
    } else {
        return await window.api.getFileById(file.id);
    }
}