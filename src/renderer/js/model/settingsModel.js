export const settingsModel = {
    get language() { return localStorage.getItem('language') || 'en'; },
    set language(val) { localStorage.setItem('language', val); },

    get theme() { return localStorage.getItem('theme') || 'light-theme'; },
    set theme(val) { localStorage.setItem('theme', val); },
};