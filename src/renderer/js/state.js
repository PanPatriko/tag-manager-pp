// Globalne zmienne
export let files = [];
export let rootLocation = null;
export let currentLocation = null;
export let tags = [];
export let locations = [];
export let currentPage = 1;
export let maxFilesPerPage = 50;
export let iconSize = 125;
export let copiedTags = null;
export const thumbnailDir = '.t'
export let vidAutoplay = true;
export let vidLoop = true;
export let defTagBgColor = '#61dd61';
export let defTagTextColor = '#ffffff';

// Settery
export function setFiles(newFiles) {
    files = newFiles;
}

export function setCurrentLoc(location) {
    currentLocation = location;
}

export function setRootLoc(location) {
    rootLocation = location;
}

export function setTags(newTags) {
    tags = newTags;
}

export function setLocations(newLocations) {
    locations = newLocations;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function setMaxFilesPerPage(maxFiles) {
    maxFilesPerPage = maxFiles;
    localStorage.setItem('maxFilesPerPage', maxFiles);
}

export function setIconSize(size) {
    iconSize = size;
    localStorage.setItem('iconSize', size);
}

export function setCopiedTags(tags) {
    copiedTags = tags;
}

export function setVidAutoplay(autoplay) {
    vidAutoplay = autoplay;
    localStorage.setItem('vidAutoplay', autoplay);
}

export function setVidLoop(loop) {
    vidLoop = loop;
    localStorage.setItem('vidLoop', loop);
}

export function setDefTagBgColor(color) {
    defTagBgColor = color;
    localStorage.setItem('defTagBgColor', color);
}

export function setDefTagTextColor(color) {
    defTagTextColor = color;
    localStorage.setItem('defTagTextColor', color);
}