import { setCurrentPage, files } from '../state.js';
import { updateFilePages } from "../content/pagination.js";
import { displayFiles } from "../content/content.js";

export const settingsView = {

    get settingsModal() { return document.getElementById('settings-modal'); },

    get openModalButton() { return document.getElementById('open-settings-modal'); },

    get closeModalButton() { return document.getElementById('close-settings-modal'); },
    
    get languageSelect() { return document.getElementById('language-select'); },

    get toggleThemeButton() { return document.getElementById('theme-toggle'); },

    get iconSizeSelect() { return document.getElementById('icon-size'); },

    set iconSizeSelect(value) { this.iconSizeSelect.value = value; },

    get maxFilesSelect() { return document.getElementById('max-files'); },

    get vidAutoplay() { return document.getElementById('vid-autoplay'); },

    get vidLoop() { return document.getElementById('vid-loop'); },

    get defTagBgColor() { return document.getElementById('def-tag-bgcolor'); },

    get defTagTextColor() { return document.getElementById('def-tag-textcolor'); },

    applyIconSize(value) {
        document.querySelectorAll('.file-container').forEach(el => {
            el.style.width = `${value}px`;
            el.style.height = `${value}px`;
        });
        document.querySelectorAll('.directory-container').forEach(el => {
            el.style.width = `${value}px`;
            el.style.height = `${value}px`;
        });
        document.querySelectorAll('.file-thumbnail-text').forEach(el => {
            el.style.fontSize = `${value / 10}px`;
        });

        const gap = Math.max(10, value / 10);
        const padding = Math.max(10, value / 12.5);
        const filesPanel = document.getElementById('files-panel');

        filesPanel.style.gap = `${gap}px`;
        filesPanel.style.padding = `${padding}px`;
        filesPanel.style.gridTemplateColumns = `repeat(auto-fill, ${value}px)`;
    },

    applyMaxFiles(value) {
        setCurrentPage(1);
        updateFilePages();
        displayFiles(files);
    },
};