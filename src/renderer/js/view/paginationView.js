const pagesSelect = document.getElementById('file-pages');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const parentDirButton = document.getElementById('parent-directory');

const fileCount = document.getElementById('total-file-count');
const selectedFileCount = document.getElementById('selected-file-count');
const currentFiles = document.getElementById('current-files');
const dirName = document.getElementById('dir-name');

export const paginationView = {
    
    setFileCount(text) {
        fileCount.textContent = text;
    },

    setCurrentFilesRange(text) {
        currentFiles.textContent = text;
    },

    setSelectedFileCount(text) {
        selectedFileCount.textContent = text;
    },

    setDirectoryName(text) {
        dirName.classList.remove('hidden');
        dirName.textContent = text;
    },

    hideDirectoryName() {
        dirName.classList.add('hidden');
    },

    disableParentDir(disable) {
        parentDirButton.disabled = disable;
    },

    renderPagesSelect(totalPages, currentPage) {
        pagesSelect.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            pagesSelect.appendChild(option);
        }
        pagesSelect.value = currentPage;
    },

    onPrevPageClick(handler) {
        prevPageButton.addEventListener('click', () => handler());
    },

    onNextPageClick(handler) {
        nextPageButton.addEventListener('click', () => handler());
    },

    onParentDirClick(handler) {
        parentDirButton.addEventListener('click', () => handler());
    },

    onPageSelectChange(handler) {
        pagesSelect.addEventListener('change', (e) => handler(e));
    }

}