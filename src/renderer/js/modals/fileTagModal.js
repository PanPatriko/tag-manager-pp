import { tags, files } from "../state.js";
import { highlightText } from "../utils.js";
import { buildTagHierarchy, renderModalFileTagsTree, addMissingParentTags, addMissingChildTags, searchTagsInclude} from "../tags.js";
import { getSelectedFiles } from "../content/content.js";
import { refreshFileInfo } from "../rightSidebar/fileInfo.js";

const fileTagFormModal = document.getElementById('file-tag-form-modal');
const addTagsButton = document.getElementById('add-tags-button');
const removeTagsButton = document.getElementById('remove-tags-button');
const searchInput = document.getElementById('file-tag-search');
const tagsContainer = document.getElementById('modal-file-tags-container');
const closeFileTagFormModal = document.getElementById('close-file-tag-form-modal');
const showChildTags = document.getElementById('show-child-tags');

fileTagFormModal.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
        searchInput.focus();
    }
});

showChildTags.addEventListener('change', fileTagsModalSearch);

searchInput.addEventListener('input', fileTagsModalSearch);

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

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;
        let filePath = file.dataset.path;

        if (fileId === 'null') {
            const fileName = filePath.split('\\').pop();
            await window.api.createFile({ name: fileName, path: filePath });
            const newFile = await window.api.getFileByPath(filePath);
            fileId = newFile.id;
            file.dataset.id = fileId;
            files.find(f => f.path === filePath).id = fileId;
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

async function removeTags() {
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

function fileTagsModalSearch() {
    const query = searchInput.value;
    const foundTags = searchTagsInclude(query);
    let completeTags = addMissingParentTags(foundTags);
    if(showChildTags.checked) {
        completeTags = addMissingChildTags(completeTags, query);
    }
    const tagHierarchy = buildTagHierarchy(completeTags);
    renderModalFileTagsTree(tagHierarchy);
    highlightText(query, 'modal-file-tags-tree', 'li span');
}