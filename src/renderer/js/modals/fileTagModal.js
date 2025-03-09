import { tags, currentLocation } from "../state.js";
import { highlightText } from "../utils.js";
import { buildTagHierarchy, renderModalFileTagsTree, addMissingParentTags, searchTagsInclude, getTagIdByName} from "../tags.js";
import { getSelectedFiles, displayDirectory } from "../content/content.js";
import { refreshFileInfo } from "../rightSidebar/fileInfo.js";

const fileTagFormModal = document.getElementById('file-tag-form-modal');
const addTagsButton = document.getElementById('add-tags-button');
const removeTagsButton = document.getElementById('remove-tags-button');
const searchInput = document.getElementById('file-tag-search');
const tagsContainer = document.getElementById('modal-file-tags-container');
const closeFileTagFormModal = document.getElementById('close-file-tag-form-modal');

searchInput.addEventListener('input', (e) =>  {
    const query = e.target.value;
    const foundTags = searchTagsInclude(query);
    const completeTags = addMissingParentTags(foundTags);
    const tagHierarchy = buildTagHierarchy(completeTags);
    renderModalFileTagsTree(tagHierarchy);
    highlightText(query, 'modal-file-tags-tree', 'li span');
});

addTagsButton.addEventListener('click', addTags);

removeTagsButton.addEventListener('click', removeTags);

closeFileTagFormModal.addEventListener('click', closeFileModal);

export async function openFileModal() {
    const tagHierarchy = buildTagHierarchy(tags);
    renderModalFileTagsTree(tagHierarchy);
    fileTagFormModal.classList.remove('hidden');
    searchInput.focus();
}

function closeFileModal() {
    searchInput.value = '';
    tagsContainer.innerHTML = "";
    fileTagFormModal.classList.add('hidden');
}

async function addTags() {
    const selectedFiles = getSelectedFiles();
    const tagIds = Array.from(tagsContainer.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);

    if(tagIds.length === 0) {
        return;
    }

    let refreshFilesPanelNeeded = false;

    for (const file of selectedFiles) {
        let fileId = file.id;

        if (!fileId) {
            const fileName = file.path.split('\\').pop();
            await window.api.createFile({ name: fileName, path: file.path });
            const newFile = await window.api.getFileByPath(file.path);
            fileId = newFile.id;
            refreshFilesPanelNeeded = true;
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
    if(refreshFilesPanelNeeded) {
        await displayDirectory(currentLocation);
    }
    closeFileModal();
}

async function removeTags() {
    const selectedFiles = getSelectedFiles(); 
    const tagIds = Array.from(tagsContainer.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);

    if(tagIds.length === 0) {
        return;
    }

    let refreshFilesPanelNeeded = false;

    for (const file of selectedFiles) {
        let fileId = file.id;

        if (!fileId) {
            const fileName = file.path.split('/').pop();
            await window.api.createFile({ name: fileName, path: file.path });
            const newFile = await window.api.getFileByPath(file.path);
            fileId = newFile.id;
            refreshFilesPanelNeeded = true;
        }

        for (const tagId of tagIds) {
            await window.api.deleteFileTag(fileId, tagId);
        }
    }

    await refreshFileInfo();
    if(refreshFilesPanelNeeded) {
        await displayDirectory(currentLocation);
    }
    closeFileModal();
}

export function addTag(tag) {
    const tagsContainer = document.getElementById('modal-file-tags-container');
    const tagDiv = document.createElement('div');
    tagDiv.className = 'tag';
    tagDiv.textContent = tag.name;
    tagDiv.dataset.id = tag.id
    tagDiv.style.color = tag.textcolor;
    tagDiv.style.backgroundColor = tag.color;
    tagDiv.addEventListener('click', function() {
        tagsContainer.removeChild(tagDiv);
    });
    tagsContainer.appendChild(tagDiv);
}