export let currentFile = null;

// Settery
export function setCurrentFile(file) {
    currentFile = file;
}

export function setCurrentFileId(id) {
    currentFile.id = id;
}