export const settingsModel = {
    get language() { return localStorage.getItem('language') || 'en'; },
    set language(val) { localStorage.setItem('language', val); },

    get theme() { return localStorage.getItem('theme') || 'light-theme'; },
    set theme(val) { localStorage.setItem('theme', val); },

    get iconSize() { return parseInt(localStorage.getItem('iconSize'), 10) || 125; },
    set iconSize(val) { localStorage.setItem('iconSize', val); },

    get maxFilesPerPage() { return parseInt(localStorage.getItem('maxFilesPerPage'), 10) || 50; },
    set maxFilesPerPage(val) { localStorage.setItem('maxFilesPerPage', val); },

    get vidAutoplay() { return localStorage.getItem('vidAutoplay') === 'true'; },
    set vidAutoplay(val) { localStorage.setItem('vidAutoplay', val); },

    get vidLoop() { return localStorage.getItem('vidLoop') === 'true'; },
    set vidLoop(val) { localStorage.setItem('vidLoop', val); },

    get defTagBgColor() { return localStorage.getItem('defTagBgColor') || '#61dd61'; },
    set defTagBgColor(val) { localStorage.setItem('defTagBgColor', val); },

    get defTagTextColor() { return localStorage.getItem('defTagTextColor') || '#ffffff'; },
    set defTagTextColor(val) { localStorage.setItem('defTagTextColor', val); }
};