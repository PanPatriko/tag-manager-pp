import { addMissingParentTags, buildTagHierarchy, renderFileTagsTree, applyExpandedFileTags } from "../tags.js"
import { displayFiles } from "../content/content.js"
import { files, currentFile, setCurrentFile } from "../state.js"

const showFileInfoButton = document.getElementById('show-file-info');
const fileInfoSection = document.getElementById('file-info');

const showFileTagsButton = document.getElementById('show-file-tags');
const fileTagsSection = document.getElementById('file-tags');

const fileIdSpan = document.getElementById('file-id');
const filePathInput = document.getElementById('file-path');
const fileNameInput = document.getElementById('file-name');
const fileNameSaveButton = document.getElementById('file-name-save');

const fileTagsTree = document.getElementById('file-tags-container');

let isMouseOverSaveButton = false;

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

showFileTagsButton.addEventListener('click', function() {
    fileTagsSection.classList.toggle('hidden');
    showFileTagsButton.classList.toggle('active');
});

fileNameInput.addEventListener('focus', async () => {
    if(await window.api.fileExists(currentFile.path)) {
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
    if(!currentFile) {
        return;
    }
    
    const newFileName = fileNameInput.value;
    const fileId = currentFile.id;
    const oldFilePath = currentFile.path;

    try {
        if(fileId != null) { 
            const result = await window.api.updateFile(fileId, newFileName, oldFilePath);
            if (result.success) {
                refreshFileInfo();              
                fileNameSaveButton.hidden = true;
                const file = files.find(file => file.id === fileId);
                if (file) {
                    file.name = newFileName;
                    file.path = result.newFilePath;
                }
                displayFiles();
            } else {
                showPopup('', window.translations['file-prev-name-save-error'] + result.error, 'error');
            }
        } else {
            const result = await window.api.updateFileNotDB(newFileName, oldFilePath);
            if (result.success) {
                filePathInput.value = result.newFilePath;
                fileNameSaveButton.hidden = true;
                const file = files.find(file => file.name === currentFile.name);
                if (file) {
                    file.name = newFileName;
                    file.path = result.newFilePath;
                }
                displayFiles();
            } else {
                showPopup('', window.translations['file-prev-name-save-error'] + error, 'error');
            }
        }      
    } catch (error) {
        showPopup('', window.translations['file-prev-name-save-error'] + error, 'error');
    }
});

export async function refreshFileInfo() {
    if (currentFile) {
        const updatedFile = await fetchFileInfo(currentFile);
        setCurrentFile(updatedFile || currentFile);
        await renderFileInfo(currentFile);
    }
}

export async function renderFileInfo(file) {
    fileTagsTree.innerHTML = "";
    fileTagsTree.dataset.i18n = "file-prev-no-tags";
    fileIdSpan.dataset.i18n = "file-prev-no-ID";

    if(file) {  
        fileIdSpan.textContent = file.id ?? window.translations['file-prev-no-ID'];
        fileIdSpan.dataset.i18n = file.id ? null : "file-prev-no-ID";

        fileNameInput.value = file.name || "";
        filePathInput.value = file.path || "";

        const tags = await window.api.getFileTags(file.id);
        if (!tags || tags.length === 0) {
            fileTagsTree.textContent = window.translations['file-prev-no-tags'];
        } else {
            const completeTags = addMissingParentTags(tags);
            const tagHierarchy = buildTagHierarchy(completeTags);
            renderFileTagsTree(tagHierarchy);
            applyExpandedFileTags()
        }
    } else {
        fileIdSpan.textContent = window.translations['file-prev-no-ID'];
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