import { tagsView } from "./tagsView.js";

const modal = document.getElementById('tag-form-modal');
const title = document.getElementById('tag-modal-title');

const tagName = document.getElementById('tag-name');
const tagColor = document.getElementById('color');
const tagTextColor = document.getElementById('textcolor');

const parentTag = document.getElementById('parent-tag');
const parentTagName = document.getElementById('parent-name');
const parentTagSuggestions = document.getElementById('parent-name-suggestions');

export const tagsModalView = {

    getTagNameValue() { return tagName.value; },

    getTagColorValue() { return tagColor.value; },

    getTagTextColorValue() { return tagTextColor.value; },

    getParentTagNameValue() { return parentTagName.value; },

    closeModal() {
        parentTag.innerHTML = '';      
        parentTagName.value = '';
        modal.classList.add('hidden');
    },

    openModal(tagModalState) {
        title.innerText = tagModalState.title;
        tagName.value = tagModalState.tagName;
        tagColor.value = tagModalState.tagColor;
        tagTextColor.value = tagModalState.tagTextColor;

        if(tagModalState.tagHierarchy) {
            const div = tagsView.renderTagHierarchyDiv(tagModalState.tagHierarchy);
            parentTag.appendChild(div);
        } else {
            parentTag.innerHTML = '';
        }

        modal.classList.remove('hidden');
        tagName.focus();
    },

    clearParentTag() {
        parentTag.innerHTML = '';
        parentTagName.value = '';    
    },

    clearParentSuggestions() {
        parentTagSuggestions.innerHTML = '';
    },

    hideParentSuggestions() {
        parentTagSuggestions.classList.add('hidden');
    },

    showParentSuggestions() {
        parentTagSuggestions.classList.remove('hidden');
    },

    renderParentSuggestion(tagHierarchy) {
        const li = document.createElement('li');
        const div = tagsView.renderTagHierarchyDiv(tagHierarchy);
        li.appendChild(div);
        parentTagSuggestions.appendChild(li);
        return li;
    },

    setSelectedParentTag(tagHierarchy) {
        const div = tagsView.renderTagHierarchyDiv(tagHierarchy);
        parentTag.appendChild(div);
    },

    onCancelClick(handler) {
        const el = document.getElementById('tag-modal-cancel');
        el.addEventListener('click', () => handler());
        modal.querySelector('.modal-close').addEventListener('click', () => handler());
    },

    onOkClick(handler) {
        const el = document.getElementById('tag-modal-ok');
        el.addEventListener('click', () => handler());
    },

    onClearParentTagClick(handler) {
        const el = document.getElementById('clear-parent-tag');
        el.addEventListener('click', () => handler());
    },

    onParentTagNameBlur(handler) {
        parentTagName.addEventListener('blur', () => handler());
    },

    onParentTagNameFocus(handler) {
        parentTagName.addEventListener('focus', () => handler());
    },

    onParentTagNameInput(handler) {
        parentTagName.addEventListener('input', () => handler());
    }
}