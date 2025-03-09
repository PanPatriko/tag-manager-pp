import { addMissingParentTags, buildTagHierarchy, renderFileTagsTree, applyExpandedFileTags } from "../tags.js"
import { files } from "../state.js"

const showFileInfoButton = document.getElementById('show-file-info');
const fileInfoSection = document.getElementById('file-info');

const showFileTagsButton = document.getElementById('show-file-tags');
const fileTagsSection = document.getElementById('file-tags');

const fileIdSpan = document.getElementById('file-id');
const filePathInput = document.getElementById('file-path');
const fileNameInput = document.getElementById('file-name');
const fileNameSaveButton = document.getElementById('file-name-save');

const fileTagsTree = document.getElementById('file-tags-container');

export let currentFile = null;

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

fileNameInput.addEventListener('focus', () => {
    fileNameSaveButton.hidden = false;
});

fileNameInput.addEventListener('focusout', () => {
    if (!isMouseOverSaveButton) {
        fileNameSaveButton.hidden = true;
    }
});

fileNameSaveButton.addEventListener('click', async () => {
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
                //alert(window.translations['file-prev-name-save-error'] + result.error);
                Swal.fire({
                    //title: window.translations['tag-alert-empty-name-title'],
                    text: window.translations['file-prev-name-save-error'] + result.error,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                });
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
                //alert(window.translations['file-prev-name-save-error'] + result.error);
                Swal.fire({
                    //title: window.translations['tag-alert-empty-name-title'],
                    text: window.translations['file-prev-name-save-error'] + result.error,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                });
            }
        }      
    } catch (error) {
        //alert(window.translations['file-prev-name-save-error'] + result.error);
        Swal.fire({
            //title: window.translations['tag-alert-empty-name-title'],
            text: window.translations['file-prev-name-save-error'] + result.error,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }
});

export async function createFileInfo(file) {
    currentFile = file;
    setFileInfo(file);
}

export async function refreshFileInfo() {
    if(currentFile) {
        if(currentFile.id == null) {
            currentFile = await window.api.getFileByPath(currentFile.path);
        } else {
            currentFile = await window.api.getFileById(currentFile.id);
        }
        setFileInfo(currentFile);
    }
}

async function setFileInfo(file) {
    fileTagsTree.innerHTML = "";
    fileTagsTree.dataset.i18n = "file-prev-no-tags";
    try {       
        fileIdSpan.textContent = file.id != null ? `${file.id}` : window.translations['file-prev-no-ID'];
        fileNameInput.value = `${file.name}`;
        filePathInput.value = `${file.path}`;

        const tags = await window.api.getFileTags(file.id);
        if (!tags || tags.length === 0) {
            fileTagsTree.textContent = window.translations['file-prev-no-tags'];
        } else {
            const completeTags = addMissingParentTags(tags);
            const tagHierarchy = buildTagHierarchy(completeTags);
            renderFileTagsTree(tagHierarchy);
            applyExpandedFileTags()
        }
    } catch (error) {
        fileTagsTree.textContent = window.translations['file-prev-no-tags'];
    }
}