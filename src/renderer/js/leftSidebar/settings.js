import { setIconSize, setMaxFilesPerPage, setCurrentPage, files, setVidAutoplay, setVidLoop, setDefTagBgColor, setDefTagTextColor} from '../state.js';
import { updateFilePages } from "../content/pagination.js";
import { displayFiles } from "../content/content.js";
import { setLanguage } from "../i18n.js";

const themeToggleButton = document.getElementById('theme-toggle');

const iconSizeSelect = document.getElementById('icon-size');
const maxFilesSelect = document.getElementById('max-files');
const vidAutoplayCheckbox = document.getElementById('vid-autoplay');
const vidLoopCheckbox = document.getElementById('vid-loop');
const defColorInput = document.getElementById('def-tag-bgcolor');
const defColorTextInput = document.getElementById('def-tag-textcolor');
const languageSelect = document.getElementById('language-select');
const filesPanel = document.getElementById('files-panel');

languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

defColorInput.addEventListener('change', (e) => {
    setDefTagBgColor(e.target.value);
});

defColorTextInput.addEventListener('change', (e) => {
    setDefTagTextColor(e.target.value);
});

vidAutoplayCheckbox.addEventListener('change', (e) => {
    setVidAutoplay(e.target.checked);
});

vidLoopCheckbox.addEventListener('change', (e) => {
    setVidLoop(e.target.checked);
});

maxFilesSelect.addEventListener('change', (e) => {
    setMaxFilesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
    updateFilePages();
    displayFiles(files);
});

themeToggleButton.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark-theme' : 'light-theme';

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(newTheme);

    localStorage.setItem('theme', newTheme);
});

iconSizeSelect.addEventListener('change', (e) => {
    const newSize = e.target.value;
    document.querySelectorAll('.file-container').forEach(el => {
        el.style.width = `${newSize}px`;
        el.style.height = `${newSize}px`;
    });
    document.querySelectorAll('.directory-container').forEach(el => {
        el.style.width = `${newSize}px`;
        el.style.height = `${newSize}px`;
    });
    document.querySelectorAll('.file-thumbnail-text').forEach(el => {
        el.style.fontSize = `${newSize / 10}px`;
    });
    setIconSize(newSize);
    setFilesPanelGapAndPadding(newSize);
});

export function setFilesPanelGapAndPadding(iconSize) { 
    const gap = Math.max(10, iconSize / 10);
    const padding = Math.max(10, iconSize / 12.5);
    filesPanel.style.gap = `${gap}px`;
    filesPanel.style.padding = `${padding}px`;
    filesPanel.style.gridTemplateColumns = `repeat(auto-fill, ${iconSize}px)`;
}