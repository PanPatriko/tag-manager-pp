export const settingsView = {
    setLanguageSelect(value) {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = value;
    }
    // ...other view methods
};