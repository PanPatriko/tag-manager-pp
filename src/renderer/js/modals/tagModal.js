import { refreshTags } from "../leftSidebar/tagsPanel.js";
import { highlightText } from "../utils.js";
import {tags, defTagBgColor, defTagTextColor} from "../state.js";
import { getTagHierarchyString, getTagHierarchySpan, searchTagsStartsWith, isChildTag } from "../tags.js";

const tagModal = document.getElementById('tag-form-modal');
const modalTitle = document.getElementById('tag-modal-title');
const tagNameInput = document.getElementById('tag-name');
const parentNameInput = document.getElementById('parent-name');
const parentTagLabel = document.getElementById('parent-tag');
const clearParentTagButton = document.getElementById('clear-parent-tag');
const parentNameSuggestions = document.getElementById('parent-name-suggestions');
const colorInput = document.getElementById('color');
const colorTextInput = document.getElementById('textcolor');
const modalOkButton = document.getElementById('tag-modal-ok');
const modalCancelButton = document.getElementById('tag-modal-cancel');

let currentTag = null;
let isEditMode = null;
let selectedParentTag = null;

parentNameInput.addEventListener('input', () => {
    const query = parentNameInput.value.toLowerCase();
    const matchingTags = searchTagsStartsWith(query);
    parentNameSuggestions.innerHTML = '';
    if (matchingTags.length > 0) {
        parentNameSuggestions.classList.remove('hidden');
        matchingTags.forEach(tag => {
            const li = document.createElement('li');
            const div = getTagHierarchySpan(tag);
            li.appendChild(div);
            li.addEventListener('click', () => {
                if(isChildTag(currentTag, tag)) {
                    Swal.fire({
                        text: window.translations['tag-alert-not-allowed-parent-tag'],
                        icon: 'warning',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'custom-swal-popup'
                        }
                    });
                    return;
                }
                parentNameInput.value = '';
                parentTagLabel.textContent = `${getTagHierarchyString(tag)} ID: ${tag.id}`;
                selectedParentTag = tag;
                parentNameSuggestions.classList.add('hidden');
            });
            parentNameSuggestions.appendChild(li);
        });
        highlightText(query, 'parent-name-suggestions', 'li span:last-child');
    } else {
        parentNameSuggestions.classList.add('hidden');
    }
});

parentNameInput.addEventListener('blur', () => {
    setTimeout(() => {
        parentNameSuggestions.classList.add('hidden');
    }, 200);
});

clearParentTagButton.addEventListener('click', () => {
    parentTagLabel.textContent = '';
    parentNameInput.value = '';
    selectedParentTag = null;
});

modalCancelButton.addEventListener('click', closeModal);

modalOkButton.addEventListener('click', async () => {
    const tagNames = tagNameInput.value.trim().split(',').map(tag => tag.trim());
    const color = colorInput.value;
    const textcolor = colorTextInput.value;

    if (tagNames.length === 0 || tagNames[0] === '') {
        //alert(window.translations['tag-alert-empty-name']);
        Swal.fire({
            title: window.translations['tag-alert-empty-name-title'],
            text: window.translations['tag-alert-empty-name'],
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
        return;
    }

    let parentId = null;
    if (selectedParentTag) {
        parentId = selectedParentTag.id;
    }

    if (isEditMode) {
        await window.api.updateTag(currentTag.id, { name: tagNames[0], parentId, color, textcolor });
    } else {
        for (const tagName of tagNames) {
            await window.api.createTag({ name: tagName, parentId, color, textcolor });
        }
    }

    closeModal();
    refreshTags();
});

export async function openModalNewTag(tag = null) {
    isEditMode = false;
    currentTag = tag;
    modalTitle.innerText = window.translations['tag-add'];
    tagNameInput.value = '';
    parentTagLabel.textContent = !!tag ? `${getTagHierarchyString(tag)} ID: ${tag.id}` : '';
    parentNameInput.value = !!tag ? tag.name : '';
    // parentNameInput.disabled = !!tag;
    // clearParentTagButton.disabled = !!tag;
    selectedParentTag = !!tag ? tag : null;
    if(tag != null) {
        colorInput.value = tag.color;
        colorTextInput.value = tag.textcolor;
    } else {
        colorInput.value = defTagBgColor;
        colorTextInput.value = defTagTextColor;
    }
    tagModal.classList.remove('hidden');
}

export async function openModalEditTag(tag) {
    isEditMode = true;
    currentTag = tag;
    modalTitle.innerText = window.translations['tag-edit'];
    tagNameInput.value = tag.name;
    selectedParentTag = tags.find(t => t.id === tag.parent_id);
    parentTagLabel.textContent = selectedParentTag ? `${getTagHierarchyString(selectedParentTag)} ID: ${selectedParentTag.id}` : '';
    // parentNameInput.disabled = false;
    // clearParentTagButton.disabled = false;
    colorInput.value = tag.color;
    colorTextInput.value = tag.textcolor;
    tagModal.classList.remove('hidden');
}

function closeModal() {
    tagModal.classList.add('hidden');
    tagNameInput.value = '';
    parentNameInput.value = '';
    colorInput.value = defTagBgColor;
    colorTextInput.value = defTagTextColor;
    currentTag = null;
    selectedParentTag = null;
}