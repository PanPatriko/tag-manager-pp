import { i18nModel } from '../model/i18nModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { i18nView } from '../view/i18nView.js';
import { settingsView } from '../view/settingsView.js';

import { previewWindow } from '../contextMenu/contextMenu.js';
import { refreshLabels } from '../content/filesInfo.js';

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

function initBodyTheme() {
    settingsView.documentTheme = settingsModel.theme;

    settingsView.toggleThemeButton.addEventListener('click', () => {
        const newTheme = settingsModel.theme === 'light-theme' ? 'dark-theme' : 'light-theme';

        settingsModel.theme = newTheme;
        settingsView.documentTheme = newTheme;
        
        previewWindowPostMessage('update-theme', { theme: newTheme });
    });
}

async function setLanguageController(locale) {
    await i18nModel.load(locale);
    i18nView.applyTranslations(i18nModel.translations);
    refreshLabels(); // TODO - tymczasowo do refaktoru reszty kodu
}

async function initLanguageSelect() { 
    settingsView.languageSelect =settingsModel.language;
    await setLanguageController(settingsModel.language);

    settingsView.languageSelect.addEventListener('change', async (e) => {
        const lang = e.target.value;
        settingsModel.language = lang;
        await setLanguageController(lang);

        previewWindowPostMessage('update-lang', { language: lang });
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
    settingsView.maxFilesSelect = maxFiles;
    settingsView.applyMaxFiles(maxFiles);

    settingsView.maxFilesSelect.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value, 10);
        settingsModel.maxFilesPerPage = newMax;
        settingsView.applyMaxFiles(newMax);
    });
}

function initDefTagColors() {
    settingsView.defTagBgColor = settingsModel.defTagBgColor;
    settingsView.defTagTextColor = settingsModel.defTagTextColor;

    settingsView.defTagBgColor.addEventListener('change', (e) => {
        settingsModel.defTagBgColor = e.target.value;
    });

    settingsView.defTagTextColor.addEventListener('change', (e) => {
        settingsModel.defTagTextColor = e.target.value;
    });
}

function initVidSettings() {
    settingsView.vidAutoplay = settingsModel.vidAutoplay;
    settingsView.vidLoop = settingsModel.vidLoop;

     settingsView.vidAutoplay.addEventListener('change', (e) => {
        settingsModel.vidAutoplay = e.target.checked;
    });

    settingsView.vidLoop.addEventListener('change', (e) => {
        settingsModel.vidLoop = e.target.checked;
    });
}

function previewWindowPostMessage(type, data) {
    if (previewWindow && !previewWindow.closed) {
        previewWindow.postMessage({ type, ...data }, '*');
    }
}