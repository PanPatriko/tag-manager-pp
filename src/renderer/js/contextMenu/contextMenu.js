import { showTagContextMenu } from "./tagContextMenu.js"
import { showLocContextMenu } from "./locationContextMenu.js"
import { showFileContextMenu } from "./fileContextMenu.js"
import { showFileTagContextMenu } from "./fileTagContextMenu.js"
import { showImgContextMenu, showVidContextMenu} from "./filePrevContextMenu.js"
import { updateSelectedFileCount } from "../content/filesInfo.js";

document.addEventListener('contextmenu', (event) => {
    const clickedTag = event.target.closest('.tag-item');
    if (clickedTag) {
        event.preventDefault();
        const tagId = clickedTag.dataset.id;
        showTagContextMenu(event.pageX, event.pageY, tagId);
    }

    const clickedFileTag = event.target.closest('.file-tag-item');
    if (clickedFileTag) {
        event.preventDefault();
        const tagId = clickedFileTag.dataset.id;
        showFileTagContextMenu(event.pageX, event.pageY, tagId);
    }

    const clickedLoc = event.target.closest('.loc-item');
    if (clickedLoc) {
        event.preventDefault();
        const locId = clickedLoc.dataset.id;
        showLocContextMenu(event.pageX, event.pageY, locId);
    }

    const clickedFile = event.target.closest('.file-container');
    //if (clickedFile && clickedFile.getAttribute('data-checked') === 'true') {
    if (clickedFile) {
        event.preventDefault();
        clickedFile.setAttribute('data-checked', true);
        updateSelectedFileCount();
        const fileId = clickedFile.dataset.id;
        const filePath = clickedFile.dataset.path;
        showFileContextMenu(event.pageX, event.pageY, fileId, filePath);
    }

    const clickedImg = event.target.closest('.file-preview-image');
    if (clickedImg) {
        event.preventDefault();
        showImgContextMenu(event.pageX, event.pageY);
    }

    const clickedVid = event.target.closest('.file-preview-video');
    if (clickedVid) {
        event.preventDefault();
        showVidContextMenu(event.pageX, event.pageY);
    }
});

export function adjustPosition(x, y, contextMenu) { 
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + menuWidth > windowWidth) {
        contextMenu.style.left = `${windowWidth - menuWidth}px`;
    }
    if (y + menuHeight > windowHeight) {
        contextMenu.style.top = `${windowHeight - menuHeight}px`;
    }
}