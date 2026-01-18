export const fileTagsModalView = {
    fileTagFormModal: null,
    addTagsButton: null,
    removeTagsButton: null,
    searchInput: null,
    tagsContainer: null,
    showChildTags: null,

    init() {
        this.fileTagFormModal = document.getElementById('file-tag-form-modal');
        this.addTagsButton = document.getElementById('add-tags-button');
        this.removeTagsButton = document.getElementById('remove-tags-button');
        this.searchInput = document.getElementById('file-tag-search');
        this.tagsContainer = document.getElementById('modal-file-tags-container');
        this.showChildTags = document.getElementById('show-child-tags');
    },

    getFileTagsTreeContainer() {
        return document.getElementById('modal-file-tags-tree');
    },

    getSearchValue() {
        return this.searchInput.value.trim();
    },

    isShowChildTagsChecked() {
        return this.showChildTags.checked;
    },

    isTagClicked(target) {
        return target.className === 'tag';
    },

    searchAutoFocus(target) {
        if (target !== this.searchInput) {
            this.searchInput.focus();
        }
    },

    searchFocus() {
        this.searchInput.focus();    
    },

    closeModal() { 
        this.searchInput.value = '';
        this.tagsContainer.innerHTML = "";
        this.fileTagFormModal.classList.add('hidden');
    },

    openModal() {   
        this.fileTagFormModal.classList.remove('hidden');
        this.searchInput.focus();
    },

    addTag(tag) {
        const tagDiv = document.createElement('div');

        tagDiv.dataset.id = tag.id
        tagDiv.className = 'tag';
        tagDiv.textContent = tag.name;

        tagDiv.style.color = tag.textColor;
        tagDiv.style.backgroundColor = tag.color;

        this.tagsContainer.appendChild(tagDiv);
    },

    removeTag(tag) {
        this.tagsContainer.removeChild(tag);
    },

    onCloseModalClick(handler) {
        const el = document.getElementById('close-file-tag-modal-button');
        el.addEventListener('click', () => handler());
    },

    onModalClick(handler) {
        this.fileTagFormModal.addEventListener('click', (event) => handler(event));
    },

    onAddTagsClick(handler) {
        this.addTagsButton.addEventListener('click', () => handler());
    },

    onRemoveTagsClick(handler) {
        this.removeTagsButton.addEventListener('click', () => handler());
    },

    onSearchInput(handler) {
        this.searchInput.addEventListener('input', () => handler());
    },

    onShowChildTagsChange(handler) {
        this.showChildTags.addEventListener('change', () => handler());
    },

    onTagsContainerClick(handler) {
        this.tagsContainer.addEventListener('click', (event) => handler(event));
    }
}