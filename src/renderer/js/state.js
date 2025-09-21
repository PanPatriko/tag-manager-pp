export let currentFile = null;
export let currentPage = 1;
export const thumbnailDir = '.t'

// Settery
export function setCurrentFile(file) {
    currentFile = file;
}

export function setCurrentFileId(id) {
    currentFile.id = id;
}

export function setCurrentPage(page) {
    currentPage = page;
}