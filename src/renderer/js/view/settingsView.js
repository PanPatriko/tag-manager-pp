import { setCurrentPage, files } from '../state.js';
import { updateFilePages } from "../content/pagination.js";
import { displayFiles } from "../content/content.js";

export const settingsView = {

    get settingsModal() {
        return document.getElementById('settings-modal');
    },

    get openModalButton() {
        return document.getElementById('open-settings-modal');
    },

    get closeModalButton() {
        return document.getElementById('close-settings-modal');
    },
    
    get languageSelect() {
        return document.getElementById('language-select');
    },

    set languageSelect(value) {
        this.languageSelect.value = value;
    },

    set documentTheme(value) {
        document.body.className = value;
    },

    get toggleThemeButton() {
        return document.getElementById('theme-toggle');
    },

    get iconSizeSelect() {
        return document.getElementById('icon-size');
    },

    set iconSizeSelect(value) {
        this.iconSizeSelect.value = value;
    },

    get maxFilesSelect() {
        return document.getElementById('max-files');
    },

    set maxFilesSelect(value) {
        this.maxFilesSelect.value = value;
    },

    get vidAutoplay() {
        return document.getElementById('vid-autoplay');
    },

    set vidAutoplay(value) {
        this.vidAutoplay.checked = value;
    },

    get vidLoop() {
        return document.getElementById('vid-loop');
    },

    set vidLoop(value) {
        this.vidLoop.checked = value;
    },

    get defTagBgColor() {
        return document.getElementById('def-tag-bgcolor');
    },

    set defTagBgColor(value) {
        this.defTagBgColor.value = value;
    },

    get defTagTextColor() {
        return document.getElementById('def-tag-textcolor');
    },

    set defTagTextColor(value) {
        this.defTagTextColor.value = value;
    },

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