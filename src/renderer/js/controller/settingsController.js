import { i18nModel } from '../model/i18nModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { i18nView } from '../view/i18nView.js';
import { settingsView } from '../view/settingsView.js';

import { previewWindow } from '../contextMenu/contextMenu.js';
import { refreshLabels } from '../content/filesInfo.js';

async function _setLanguage(locale) {
    await i18nModel.load(locale);
    i18nView.applyTranslations(i18nModel.translations);
    refreshLabels(); // TODO - tymczasowo do refaktoru reszty kodu
}

function _previewWindowPostMessage(type, data) {
    if (previewWindow && !previewWindow.closed) {
        previewWindow.postMessage({ type, ...data }, '*');
    }
}

function initBodyTheme() {
    document.body.className = settingsModel.theme;

    settingsView.toggleThemeButton.addEventListener('click', () => {
        const newTheme = settingsModel.theme === 'light-theme' ? 'dark-theme' : 'light-theme';

        settingsModel.theme = newTheme;
        document.body.className = newTheme;
        
        _previewWindowPostMessage('update-theme', { theme: newTheme });
    });
}

async function initLanguageSelect() { 
    settingsView.languageSelect.value = settingsModel.language;
    await _setLanguage(settingsModel.language);

    settingsView.languageSelect.addEventListener('change', async (e) => {
        const lang = e.target.value;
        settingsModel.language = lang;
        await _setLanguage(lang);

        _previewWindowPostMessage('update-lang', { language: lang });
    });
}

function initIconSizeSelect() {
    const iconSize = settingsModel.iconSize;
    settingsView.iconSizeSelect = iconSize;
    settingsView.applyIconSize(iconSize);

    settingsView.iconSizeSelect.addEventListener('change', (e) => {
        const newSize = e.target.value;
        settingsModel.iconSize = newSize;
        settingsView.applyIconSize(newSize);
    });
}

function initMaxFilesSelect() {
    const maxFiles = settingsModel.maxFilesPerPage;
    settingsView.maxFilesSelect.value = maxFiles;
    settingsView.applyMaxFiles(maxFiles);

    settingsView.maxFilesSelect.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value, 10);
        settingsModel.maxFilesPerPage = newMax;
        settingsView.applyMaxFiles(newMax);
    });
}

function initDefTagColors() {
    settingsView.defTagBgColor.value = settingsModel.defTagBgColor;
    settingsView.defTagTextColor.value = settingsModel.defTagTextColor;

    settingsView.defTagBgColor.addEventListener('change', (e) => {
        settingsModel.defTagBgColor = e.target.value;
    });

    settingsView.defTagTextColor.addEventListener('change', (e) => {
        settingsModel.defTagTextColor = e.target.value;
    });
}

function initVidSettings() {
    settingsView.vidAutoplay.checked = settingsModel.vidAutoplay;
    settingsView.vidLoop.checked = settingsModel.vidLoop;

     settingsView.vidAutoplay.addEventListener('change', (e) => {
        settingsModel.vidAutoplay.checked = e.target.checked;
    });

    settingsView.vidLoop.addEventListener('change', (e) => {
        settingsModel.vidLoop.checked = e.target.checked;
    });
}

export async function initSettingsController() {
    initBodyTheme();
    await initLanguageSelect();
    initIconSizeSelect();
    initMaxFilesSelect();
    initDefTagColors();
    initVidSettings();

    settingsView.openModalButton.addEventListener('click', () => {
        settingsView.settingsModal.classList.remove('hidden');
    });

    settingsView.closeModalButton.addEventListener('click', () => {
        settingsView.settingsModal.classList.add('hidden');
    });
}