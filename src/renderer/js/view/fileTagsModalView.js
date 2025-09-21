const fileTagFormModal = document.getElementById('file-tag-form-modal');
const addTagsButton = document.getElementById('add-tags-button');
const removeTagsButton = document.getElementById('remove-tags-button');
const searchInput = document.getElementById('file-tag-search');
const tagsContainer = document.getElementById('modal-file-tags-container');

const showChildTags = document.getElementById('show-child-tags');

export const fileTagsModalView = {

    getFileTagsTreeContainer() {
        return document.getElementById('modal-file-tags-tree');
    },

    getSearchValue() {
        return searchInput.value.trim();
    },

    isShowChildTagsChecked() {
        return showChildTags.checked;
    },

    isTagClicked(target) {
        return target.className === 'tag';
    },

    searchAutoFocus(target) {
        if (target !== searchInput) {
            searchInput.focus();
        }
    },

    searchFocus() {
        searchInput.focus();    
    },

    closeModal() { 
        searchInput.value = '';
        tagsContainer.innerHTML = "";
        fileTagFormModal.classList.add('hidden');
    },

    openModal() {   
        fileTagFormModal.classList.remove('hidden');
        searchInput.focus();
    },

    addTag(tag) {
        const tagDiv = document.createElement('div');

        tagDiv.dataset.id = tag.id
        tagDiv.className = 'tag';
        tagDiv.textContent = tag.name;

        tagDiv.style.color = tag.textColor;
        tagDiv.style.backgroundColor = tag.color;

        tagsContainer.appendChild(tagDiv);
    },

    removeTag(tag) {
        tagsContainer.removeChild(tag);
    },

    onCloseModalClick(handler) {
        const el = document.getElementById('close-file-tag-modal-button');
        el.addEventListener('click', () => handler());
    },

    onModalClick(handler) {
        fileTagFormModal.addEventListener('click', (event) => handler(event));
    },

    onAddTagsClick(handler) {
        addTagsButton.addEventListener('click', () => handler());
    },

    onRemoveTagsClick(handler) {
        removeTagsButton.addEventListener('click', () => handler());
    },

    onSearchInput(handler) {
        searchInput.addEventListener('input', () => handler());
    },

    onShowChildTagsChange(handler) {
        showChildTags.addEventListener('change', () => handler());
    },

    onTagsContainerClick(handler) {
        tagsContainer.addEventListener('click', (event) => handler(event));
    }
}