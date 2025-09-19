import { highlightText } from "../utils.js";
import { getSelectedFiles } from "../content/content.js";
import { refreshFileInfo } from "../rightSidebar/fileInfo.js";

import { filesModel } from "../model/filesModel.js";
import { tagsModel } from '../model/tagsModel.js';

import { tagsView } from '../view/tagsView.js';

const fileTagFormModal = document.getElementById('file-tag-form-modal');
const addTagsButton = document.getElementById('add-tags-button');
const removeTagsButton = document.getElementById('remove-tags-button');
const searchInput = document.getElementById('file-tag-search');
const tagsContainer = document.getElementById('modal-file-tags-container');
const closeFileTagFormModal = document.getElementById('close-file-tag-form-modal');
const showChildTags = document.getElementById('show-child-tags');

fileTagFormModal.addEventListener('click', (e) => { // controller
    if (e.target !== searchInput) {
        searchInput.focus();
    }
});

showChildTags.addEventListener('change', fileTagsModalSearch);

searchInput.addEventListener('input', fileTagsModalSearch);

addTagsButton.addEventListener('click', addTags);

removeTagsButton.addEventListener('click', removeTags);

closeFileTagFormModal.addEventListener('click', closeFileModal);

export async function openFileModal() { // controller or view
    const tagHierarchy = tagsModel.buildTagHierarchy();
    tagsView.renderTagTree({
        container: 'modal-file-tags-tree',
        tagHierarchy,
        childrenInitiallyVisible: true,
        onTagClick: (tag, span, li) => {
            const container = document.getElementById('modal-file-tags-container');
            const currentTags = Array.from(container.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);
            if (!currentTags.includes(tag.id.toString())) {
                _addTagDivToContainer(tag, container);
            }
            document.getElementById('file-tag-search').focus();
        }
    });    
    fileTagFormModal.classList.remove('hidden');
    searchInput.focus();
}

function _addTagDivToContainer(tag, container) { 
    const tagDiv = document.createElement('div');

    tagDiv.dataset.id = tag.id
    tagDiv.className = 'tag';
    tagDiv.textContent = tag.name;            
    tagDiv.style.color = tag.textColor;
    tagDiv.style.backgroundColor = tag.color;
    tagDiv.addEventListener('click', function() {
        container.removeChild(tagDiv);
    });
    container.appendChild(tagDiv);
}

function closeFileModal() { // view
    searchInput.value = '';
    tagsContainer.innerHTML = "";
    fileTagFormModal.classList.add('hidden');
}

async function addTags() { // model
    const selectedFiles = getSelectedFiles();
    const tagIds = Array.from(tagsContainer.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);

    if(tagIds.length === 0) {
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;
        let filePath = file.dataset.path;

        if (fileId === 'null') {
            const fileName = filePath.split('\\').pop();
            await window.api.createFile({ name: fileName, path: filePath });
            const newFile = await window.api.getFileByPath(filePath);
            fileId = newFile.id;
            file.dataset.id = fileId;
            filesModel.files.find(f => f.path === filePath).id = fileId;
        }

        for (const tagId of tagIds) {
            try {
                await window.api.addFileTag(fileId, tagId);
            } catch (error) {
                console.error(error);
            }         
        }
    }

    await refreshFileInfo();
    closeFileModal();
}

async function removeTags() { // model
    const selectedFiles = getSelectedFiles(); 
    const tagIds = Array.from(tagsContainer.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);

    if(tagIds.length === 0) {
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;

        if (fileId != 'null') {     
            for (const tagId of tagIds) {
                await window.api.deleteFileTag(fileId, tagId);
            }
        }
    }

    await refreshFileInfo();
    closeFileModal();
}

function fileTagsModalSearch() { // controller
    const query = searchInput.value;
    const foundTags = tagsModel.searchTags(query, 'include');
    let completeTags = tagsModel.addMissingParentTags(foundTags);
    if(showChildTags.checked) {
        completeTags = tagsModel.addMissingChildTags(completeTags, query);
    }
    const tagHierarchy = tagsModel.buildTagHierarchy(completeTags);
    tagsView.renderTagTree({
        container: 'modal-file-tags-tree',
        tagHierarchy,
        childrenInitiallyVisible: true,
        onTagClick: (tag, span, li) => {
            const container = document.getElementById('modal-file-tags-container');
            const currentTags = Array.from(container.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);
            if (!currentTags.includes(tag.id.toString())) {
                _addTagDivToContainer(tag, container);
            }
            document.getElementById('file-tag-search').focus();
        }
    });   
    highlightText(query, 'modal-file-tags-tree', 'li span');
}