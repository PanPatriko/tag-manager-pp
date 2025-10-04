const leftSidebar = document.getElementById('left-sidebar');
const resizeHandle = document.getElementById('left-resize-handle');
const toggleSidebar = document.getElementById("toggle-tag-sidebar");

const leftSidebarItems = document.querySelectorAll(".left-sidebar-item");
const menuElements = document.querySelectorAll(".menu-element");

function setActiveButton(elementId) {
    const button = document.getElementById(elementId);
    if (button) {
        menuElements.forEach(el => el.classList.remove('active'));
        button.classList.add('active');
    }
}

function setToggleButtonIcon(isHidden) {
    toggleSidebar.style.backgroundImage = isHidden
        ? "url('images/right-arrow.png')"
        : "url('images/left-arrow.png')";
}

export const leftSidebarView = {

    showPanel(panelId) {
        leftSidebarItems.forEach(item => item.classList.add('hidden'));
        const isHidden = leftSidebar.classList.contains("hidden");
        setToggleButtonIcon(isHidden);

        if (isHidden) return;

        document.getElementById(panelId).classList.remove('hidden');
        document.getElementById('left-sidebar-menu').classList.remove('hidden');
        resizeHandle.classList.remove('hidden');

        setActiveButton(panelId === 'location-panel' ? 'location-button' : 'tags-button');
    },

    getMenuElements() {
        return menuElements;
    },

    toggleSidebar() {
        return leftSidebar.classList.toggle("hidden");
    },

    onToggleSidebarClick(handler) {
        toggleSidebar.addEventListener('click', () => handler());
    },
};