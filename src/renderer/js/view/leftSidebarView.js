export const leftSidebarView = {
    leftSidebar: null,
    resizeHandle: null,
    leftSidebarToggle: null,
    leftSidebarItems: null,
    menuElements: null,

    init() {
        this.leftSidebar = document.getElementById('left-sidebar');
        this.resizeHandle = document.getElementById('left-resize-handle');
        this.leftSidebarToggle = document.getElementById("toggle-tag-sidebar");
        this.leftSidebarItems = document.querySelectorAll(".left-sidebar-item");
        this.menuElements = document.querySelectorAll(".menu-element");
    },

    showPanel(panelId) {
        this.leftSidebarItems.forEach(item => item.classList.add('hidden'));
        const isHidden = this.leftSidebar.classList.contains("hidden");
        this.setToggleButtonIcon(isHidden);

        if (isHidden) return;

        document.getElementById(panelId).classList.remove('hidden');
        document.getElementById('left-sidebar-menu').classList.remove('hidden');
        this.resizeHandle.classList.remove('hidden');

        this.setActiveButton(panelId === 'location-panel' ? 'location-button' : 'tags-button');
    },

    getMenuElements() {
        return this.menuElements;
    },

    toggleSidebar() {
        return this.leftSidebar.classList.toggle("hidden");
    },

    setActiveButton(elementId) {
        const button = document.getElementById(elementId);
        if (button) {
            this.menuElements.forEach(el => el.classList.remove('active'));
            button.classList.add('active');
        }
    },

    setToggleButtonIcon(isHidden) {
        this.leftSidebarToggle.style.backgroundImage = isHidden
            ? "url('images/right-arrow.png')"
            : "url('images/left-arrow.png')";
    },

    onToggleSidebarClick(handler) {
        this.leftSidebarToggle.addEventListener('click', () => handler());
    },
}