import { tagsView } from "./tagsView.js";

export const tagsModalView = {

    modal: null,
    title: null,
    tagName: null,
    tagColor: null,
    tagTextColor: null,
    parentTag: null,
    parentTagName: null,
    parentTagSuggestions: null,

    init() {
        this.modal = document.getElementById('tag-form-modal');
        this.title = document.getElementById('tag-modal-title');

        this.tagName = document.getElementById('tag-name');
        this.tagColor = document.getElementById('color');
        this.tagTextColor = document.getElementById('textcolor');

        this.parentTag = document.getElementById('parent-tag');
        this.parentTagName = document.getElementById('parent-name');
        this.parentTagSuggestions = document.getElementById('parent-name-suggestions');
    },

    getTagNameValue() { return this.tagName.value; },

    getTagColorValue() { return this.tagColor.value; },

    getTagTextColorValue() { return this.tagTextColor.value; },

    getParentTagNameValue() { return this.parentTagName.value; },

    closeModal() {
        this.parentTag.innerHTML = '';      
        this.parentTagName.value = '';
        this.modal.classList.add('hidden');
    },

    openModal(tagModalState) {
        this.title.innerText = tagModalState.title;
        this.tagName.value = tagModalState.tagName;
        this.tagColor.value = tagModalState.tagColor;
        this.tagTextColor.value = tagModalState.tagTextColor;

        if(tagModalState.tagHierarchy) {
            const div = tagsView.renderTagHierarchyDiv(tagModalState.tagHierarchy);
            this.parentTag.appendChild(div);
        } else {
            this.parentTag.innerHTML = '';
        }

        this.modal.classList.remove('hidden');
        this.tagName.focus();
    },

    clearParentTag() {
        this.parentTag.innerHTML = '';
        this.parentTagName.value = '';    
    },

    clearParentSuggestions() {
        this.parentTagSuggestions.innerHTML = '';
    },

    hideParentSuggestions() {
        this.parentTagSuggestions.classList.add('hidden');
    },

    showParentSuggestions() {
        this.parentTagSuggestions.classList.remove('hidden');
    },

    renderParentSuggestion(tagHierarchy) {
        const li = document.createElement('li');
        const div = tagsView.renderTagHierarchyDiv(tagHierarchy);
        li.appendChild(div);
        this.parentTagSuggestions.appendChild(li);
        return li;
    },

    setSelectedParentTag(tagHierarchy) {
        const div = tagsView.renderTagHierarchyDiv(tagHierarchy);
        this.parentTag.appendChild(div);
    },

    onCancelClick(handler) {
        const el = document.getElementById('tag-modal-cancel');
        el.addEventListener('click', () => handler());
        this.modal.querySelector('.modal-close').addEventListener('click', () => handler());
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
        this.parentTagName.addEventListener('blur', () => handler());
    },

    onParentTagNameFocus(handler) {
        this.parentTagName.addEventListener('focus', () => handler());
    },

    onParentTagNameInput(handler) {
        this.parentTagName.addEventListener('input', () => handler());
    }
}