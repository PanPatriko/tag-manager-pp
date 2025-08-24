export let files = [];
export let currentFile = null;
export let rootLocation = null;
export let currentLocation = null;
export let locations = [];
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

export function setCurrentLoc(location) {
    currentLocation = location;
}

export function setRootLoc(location) {
    rootLocation = location;
}

export function setLocations(newLocations) {
    locations = newLocations;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function setCopiedTags(tags) {
    copiedTags = tags;
}