import { updateContentWidth } from "../content/content.js";

const leftSidebar = document.getElementById("left-sidebar");
const toggleTagButton = document.getElementById("toggle-tag-sidebar");
const leftSidebarItems = document.querySelectorAll(".left-sidebar-item");
const menuElements = document.querySelectorAll(".menu-element");
const resizeHandle = document.getElementById('left-resize-handle');

let startX, startWidth, lastSidebarWidth = 15;

menuElements.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(button);
        showPanel(button.dataset.panel);
    });
});

toggleTagButton.addEventListener("click", () => {
    const isHidden = leftSidebar.classList.toggle("hidden");
    toggleTagButton.style.backgroundImage = isHidden ? "url('images/right-arrow.png')" : "url('images/left-arrow.png')";

    if (isHidden) {
        leftSidebarItems.forEach(item => {
            if (!item.classList.contains("hidden")) {
                item.classList.toggle("hidden");
            }
        });
    } else {
        const activePanel = localStorage.getItem('activePanel');
        if (activePanel) {
            showPanel(activePanel);
        } else {
            showPanel('settings-panel');
        }
    }

    leftSidebar.style.width = isHidden ? "0" : `${lastSidebarWidth}%`;
    updateContentWidth();
});

resizeHandle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    startX = e.clientX;
    startWidth = leftSidebar.offsetWidth;

    leftSidebar.style.transition = 'none';

    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
});

function resizeSidebar(e) {
    const newWidth = startWidth + (e.clientX - startX);
    const screenWidth = window.innerWidth;
    const newWidthPercent = Math.min(Math.round((newWidth / screenWidth) * 100), 100);
    leftSidebar.style.width = `${newWidthPercent}%`;
    lastSidebarWidth = newWidthPercent;
    updateContentWidth();
}

function stopResizing() {
    leftSidebar.style.transition = 'transform 1s ease, width 1s ease';
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
}

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
        showPanel('settings-panel');
    }
}

function setActiveButton(button) {
    menuElements.forEach(el => el.classList.remove('active'));
    button.classList.add('active');
    localStorage.setItem('activeMenuElement', button.id);
}

function showPanel(panelId) {
    leftSidebarItems.forEach(item => item.classList.add('hidden'));
    document.getElementById(panelId).classList.remove('hidden');
    document.getElementById('left-sidebar-menu').classList.remove('hidden');
    resizeHandle.classList.remove('hidden');
    localStorage.setItem('activePanel', panelId);
}