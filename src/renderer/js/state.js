export let files = [];
export let currentFile = null;
export let currentPage = 1;
export let copiedTags = null;
export const thumbnailDir = '.t'

// Settery
export function setFiles(newFiles) {
    files = newFiles;
}

export function setCurrentFile(file) {
    currentFile = file;
}

export function setCurrentFileId(id) {
    currentFile.id = id;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function setCopiedTags(tags) {
    copiedTags = tags;
}