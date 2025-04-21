import { currentPage, maxFilesPerPage, iconSize, files, setFiles, thumbnailDir, rootLocation, setCurrentLoc} from "../state.js"
import { updateFileCount, updateCurrentFilesLabel, updateSelectedFileCount} from "./filesInfo.js"
import { updateFilePages } from "./pagination.js"
import { createFilePreview } from "../rightSidebar/filePreview.js"
import { openFileModal } from "../modals/fileTagModal.js"
import { copyTags, pasteTags } from "../contextMenu/fileContextMenu.js"
import { showPopup } from "../utils.js"

const content = document.getElementById('content');
const filesPanel = document.getElementById('files-panel');
const leftSidebar = document.getElementById('left-sidebar');
const rightSidebar = document.getElementById('right-sidebar');

const path = window.api.path;
const sortByNameButton = document.getElementById('sort-by-name');

const loadingBarContainer = document.getElementById('loading-bar-container');
const loadingBar = document.getElementById('loading-bar');

let lastSelectedIndex = null;
let sortOrder = 'asc';  // Default sort order

document.addEventListener('keydown', function(e) {
    if (isModalOpen()) {
        return;
    }

    if(!isTextInputFocused()) {
        const firstSelectedFile = document.querySelector('.file-container[data-checked="true"]');
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            selectAllFiles();
        }
        if (e.ctrlKey && e.key === 'c') {
            if(firstSelectedFile) {
                copyTags(firstSelectedFile.dataset.id);
            }                     
        }
        if (e.ctrlKey && e.key === 'e') {          
            if(firstSelectedFile) {
                openFileModal();
            }
        }
        if (e.ctrlKey && e.key === 'v') {
            pasteTags();
        }
    }
});

document.addEventListener('keyup', function(e) {
    if (isModalOpen()) {
        return;
    }
    if (!isTextInputFocused()) {
        if (e.key === 'ArrowRight') {
            selectNextFile();
        }
        if (e.key === 'ArrowLeft') {
            selectPreviousFile();
        }
    }
});

function isTextInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}

function isModalOpen() {
    const modals = document.querySelectorAll('.modal');
    return Array.from(modals).some(modal => !modal.classList.contains('hidden'));
}

sortByNameButton.addEventListener('click', function() {
    if (files.length === 0) return;
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    displayFiles();
    updateSortDirectionIndicator();
});

export function sortFiles() {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    const sortedFiles = [...files].sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) {
            return -1;
        }
        if (!a.isDirectory && b.isDirectory) {
            return 1;
        }
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortOrder === 'asc' ? collator.compare(nameA, nameB) : collator.compare(nameB, nameA);
    });
    setFiles(sortedFiles);
}

function updateSortDirectionIndicator() {
    if (sortOrder === 'asc') {
        //sortDirectionElement.textContent = '▲'; // Old style
        sortByNameButton.style.backgroundImage = "url('images/sort-up-az.png')"
    } else {
        sortByNameButton.style.backgroundImage = "url('images/sort-down-az.png')"
        //sortDirectionElement.textContent = '▼'; // Old style
    }
}

export function getSelectedFiles() {
    return document.querySelectorAll('.file-container[data-checked="true"]');
}

function selectAllFiles() {
    document.querySelectorAll('.file-container').forEach(el => {
        el.setAttribute('data-checked', 'true');
    });
    updateSelectedFileCount();
}

function selectNextFile() {
    const fileContainers = document.querySelectorAll('.file-container');
    if (fileContainers.length === 0) return;

    if (lastSelectedIndex === null) {
        lastSelectedIndex = 0;
    } else {
        lastSelectedIndex = (lastSelectedIndex + 1) % fileContainers.length;
    }

    selectFile(fileContainers[lastSelectedIndex]);
}

function selectPreviousFile() {
    const fileContainers = document.querySelectorAll('.file-container');
    if (fileContainers.length === 0) return;

    if (lastSelectedIndex === null) {
        lastSelectedIndex = fileContainers.length - 1;
    } else {
        lastSelectedIndex = (lastSelectedIndex - 1 + fileContainers.length) % fileContainers.length;
    }

    selectFile(fileContainers[lastSelectedIndex]);
}

function selectFile(fileContainer) {
    document.querySelectorAll('.file-container').forEach(file => {
        file.dataset.checked = 'false';
    });

    fileContainer.dataset.checked = 'true';
    let file;
    const fileId = fileContainer.dataset.id;

    if(!fileId) {
        file = files.find(f => f.id == fileId);
    } else {
        const filePath = fileContainer.dataset.path;
        file = files.find(f => f.path === filePath);
    }
    updateSelectedFileCount();
    createFilePreview(file);
}

function toggleSelection(container, isCtrlPressed, isShiftPressed) {
    const fileContainers = Array.from(document.querySelectorAll('.file-container'));
    const currentIndex = fileContainers.indexOf(container);

    if (isShiftPressed && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        for (let i = start; i <= end; i++) {
            fileContainers[i].setAttribute('data-checked', 'true');
        }
    } else if (isCtrlPressed) {
        const isChecked = container.getAttribute('data-checked') === 'true';
        container.setAttribute('data-checked', !isChecked);
    } else {
        fileContainers.forEach(el => {
            el.setAttribute('data-checked', 'false');
        });
        container.setAttribute('data-checked', 'true');
    }

    lastSelectedIndex = currentIndex;
    updateSelectedFileCount();
}

export async function displayDirectory(dirPath) {
    
    const dirFiles = await window.api.getFilesInPath(dirPath);
    if (dirFiles.error) {
        console.error(dirFiles.error);
        showPopup("", dirFiles.error, 'error');
        return;
    }

    for (const file of dirFiles) {
        if (!file.isDirectory) {
            const foundFile = await window.api.getFileByPath(file.path);
            if (foundFile) {
                file.id = foundFile.id;
            } else {
                file.id = null;
            }
        }
    }

    const prevDirBttn = document.getElementById('prev-directory');
    if(rootLocation === dirPath) {     
        prevDirBttn.disabled = true;
    } else {
        prevDirBttn.disabled = false;
    }
    document.getElementById('dir-name').textContent = await path.basename(dirPath, "");
    setCurrentLoc(dirPath);
    setFiles(dirFiles);
    displayFiles();
}

export async function displayFiles() {
    const panel = document.getElementById('files-panel');
    panel.innerHTML = '';
    
    updateFilePages();
    sortFiles();

    const start = (currentPage - 1) * maxFilesPerPage;
    const end = Math.min(start + maxFilesPerPage, files.length);
    const currentFiles = files.slice(start, end);

    loadingBarContainer.classList.remove('hidden');
    loadingBar.style.width = '0%';
    for (let i = 0; i < currentFiles.length; i++) {
        const file = currentFiles[i];
        if (!file.isDirectory) {
            const filePath = file.path;
            const thumbnailPath = await getThumbnailPath(filePath);

            if (!await window.api.fileExists(thumbnailPath)) {
                try {
                    const thumbnailDir = await path.dirname(thumbnailPath);
                    if (!await window.api.fileExists(thumbnailDir)) {
                        await window.api.createDirectory(thumbnailDir);
                    }
                    await window.api.generateThumbnail(filePath, thumbnailPath);
                } catch (error) {
                    console.error(error);
                }
            }
        }
        const progress = ((i + 1) / currentFiles.length) * 100;
        loadingBar.style.width = `${progress}%`;
    }
    loadingBarContainer.classList.add('hidden');

    for (const file of currentFiles) {
        const containerWrapper = document.createElement('div');
        containerWrapper.className = 'file-container-wrapper';

        const span = document.createElement('span');
        span.className = 'file-container-text';
        span.textContent = file.name;

        const container = document.createElement('div');
        container.style.width = iconSize + 'px';
        container.style.height = iconSize + 'px';
        container.setAttribute('title', file.name);

        const thumbnail = document.createElement('img');
        thumbnail.className = 'file-thumbnail';
        thumbnail.alt = file.name;
        thumbnail.style.width = '75%';
        thumbnail.style.height = '75%';
 
        if(file.isDirectory) {     
            thumbnail.src = 'images/folder-256.png';      
            container.className = 'directory-container';
            container.addEventListener ('dblclick', async (e) => {
                displayDirectory(file.path);
            });   
        } else {               
            container.className = 'file-container';
            container.dataset.path = file.path;           
            container.dataset.id = file.id; 
            
            const filePath = file.path;
            const thumbnailPath = await getThumbnailPath(filePath);

            if(!await window.api.fileExists(filePath)) {
                thumbnail.src = 'images/cross.png';
                container.style.backgroundColor = "pink";
            } else {
                if (!await window.api.fileExists(thumbnailPath)) {
                    thumbnail.src = 'images/file-256.png';               
                } else {
                    thumbnail.src = thumbnailPath
                    thumbnail.style.width = '100%';
                    thumbnail.style.height = '100%';
                }
            }   
              
            container.addEventListener ('click', async (e) => {
                toggleSelection(container, e.ctrlKey, e.shiftKey);
                if (lastSelectedIndex !== null && (e.ctrlKey || e.shiftKey)) {
                    return;
                }    
                createFilePreview(file);
            });   
        }
        container.appendChild(thumbnail);
        containerWrapper.appendChild(container);
        containerWrapper.appendChild(span);
        panel.appendChild(containerWrapper);
        //await new Promise(r => setTimeout(r, 100));
    };
               
    const folderFilesCount = files.filter(file => file.isDirectory).length;
    updateFileCount(files.length - folderFilesCount, folderFilesCount);
    if(files.length > 0) {
        updateCurrentFilesLabel(start + 1, end);
    } else {
        updateCurrentFilesLabel(0, 0);
    }

    updateSelectedFileCount();
}

async function getThumbnailPath(filePath) {
    const dir = await path.dirname(filePath);
    const ext = await path.extname(filePath);
    const base = await path.basename(filePath, ext);
    const thumbnailDirPath = await path.join(dir, thumbnailDir);
    const thumbnailPath = await path.join(thumbnailDirPath, `${base}${ext}.jpg`);
    return thumbnailPath;
}

export function updateContentWidth() {
    const leftSidebarWidth = leftSidebar.classList.contains('hidden') ? 0 : Math.round(parseFloat(getComputedStyle(leftSidebar).width) / window.innerWidth * 100);
    const rightSidebarWidth = rightSidebar.classList.contains('hidden') ? 0 : Math.round(parseFloat(getComputedStyle(rightSidebar).width) / window.innerWidth * 100);
    const contentWidth = 100 - leftSidebarWidth - rightSidebarWidth;
    content.style.width = `${contentWidth}%`;
}