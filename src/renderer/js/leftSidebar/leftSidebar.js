const leftSidebarItems = document.querySelectorAll(".left-sidebar-item");
const menuElements = document.querySelectorAll(".menu-element");
const resizeHandle = document.getElementById('left-resize-handle');

menuElements.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(button);
        showPanel(button.dataset.panel);
    });
});

export function showActivePanel() {
    const activeMenuElement = localStorage.getItem('activeMenuElement');
    const activePanel = localStorage.getItem('activePanel');

    if (activeMenuElement) {
        const button = document.getElementById(activeMenuElement);
        if (button) {
            setActiveButton(button);
        }
    }

    if (activePanel) {
        showPanel(activePanel);
    } else {
        showPanel('location-panel');
    }
}

function setActiveButton(button) {
    menuElements.forEach(el => el.classList.remove('active'));
    button.classList.add('active');
    localStorage.setItem('activeMenuElement', button.id);
}

export function showPanel(panelId) {
    leftSidebarItems.forEach(item => item.classList.add('hidden'));
    document.getElementById(panelId).classList.remove('hidden');
    document.getElementById('left-sidebar-menu').classList.remove('hidden');
    resizeHandle.classList.remove('hidden');
    localStorage.setItem('activePanel', panelId);
}