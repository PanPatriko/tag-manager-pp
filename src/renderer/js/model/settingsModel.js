export const settingsModel = {
    get language() { return localStorage.getItem('language') || 'en'; },
    set language(val) { localStorage.setItem('language', val); },

    // ...other settings
};