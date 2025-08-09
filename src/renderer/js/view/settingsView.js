export const settingsView = {
    setLanguageSelect(value) {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = value;
    },

    setDocumentTheme(value) {
        document.body.className = value;
    }

    // ...other view methods TODO
};