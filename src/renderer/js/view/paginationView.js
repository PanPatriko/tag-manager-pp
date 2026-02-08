import { inputAutoResize } from '../utils.js';

export const paginationView = {

    pagesSelect: null,
    prevPageButton: null,
    nextPageButton: null,
    parentDirButton: null,
    fileCount: null,
    selectedFileCount: null,
    currentFiles: null,
    dirName: null,

    init () {
        this.pagesSelect = document.getElementById('file-pages');
        this.prevPageButton = document.getElementById('prev-page');
        this.nextPageButton = document.getElementById('next-page');
        this.parentDirButton = document.getElementById('parent-directory');
        this.fileCount = document.getElementById('total-file-count');
        this.selectedFileCount = document.getElementById('selected-file-count');
        this.currentFiles = document.getElementById('current-files');
        this.dirName = document.getElementById('dir-name');
    },

    disableNextPageButton(disable) {
        this.nextPageButton.disabled = disable;
    },

    disablePrevPageButton(disable) {
        this.prevPageButton.disabled = disable;
    },
    disableParentDirButton(disable) {
        this.parentDirButton.disabled = disable;
    },

    setFileCount(text) {
        this.fileCount.value = text;
        inputAutoResize(this.fileCount);
    },

    setCurrentFilesRange(text) {
        this.currentFiles.value = text;
        inputAutoResize(this.currentFiles);
    },

    setSelectedFileCount(text) {
        this.selectedFileCount.value = text;
        inputAutoResize(this.selectedFileCount);
    },

    setDirectoryName(text) {
        this.dirName.classList.remove('hidden');
        this.dirName.value = text;
        inputAutoResize(this.dirName);
    },

    hideDirectoryName() {
        this.dirName.classList.add('hidden');
    },

    disableParentDir(disable) {
        this.parentDirButton.disabled = disable;
    },

    renderPagesSelect(totalPages, currentPage) {
        this.pagesSelect.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            this.pagesSelect.appendChild(option);
        }
        this.pagesSelect.value = currentPage;
    },

    onPrevPageClick(handler) {
        this.prevPageButton.addEventListener('click', () => handler());
    },

    onNextPageClick(handler) {
        this.nextPageButton.addEventListener('click', () => handler());
    },

    onParentDirClick(handler) {
        this.parentDirButton.addEventListener('click', () => handler());
    },

    onPageSelectChange(handler) {
        this.pagesSelect.addEventListener('change', (e) => handler(e));
    }
}
