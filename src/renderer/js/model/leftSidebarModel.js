export const leftSidebarModel = {

    getActivePanel() {
        return localStorage.getItem('activePanel') || 'location-panel';
    },

    setActivePanel(id) {
        localStorage.setItem('activePanel', id);
    },

};