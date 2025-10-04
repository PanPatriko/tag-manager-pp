import { leftSidebarModel } from '../model/leftSidebarModel.js';
import { layoutModel } from '../model/layoutModel.js';

import { leftSidebarView } from '../view/leftSidebarView.js';
import { layoutView } from '../view/layoutView.js';

function handleMenuClick(button) {
    leftSidebarModel.setActivePanel(button.dataset.panel);
    leftSidebarView.showPanel(button.dataset.panel);
}

export function initLeftSidebar() {
    leftSidebarView.showPanel(leftSidebarModel.getActivePanel());

    leftSidebarView.getMenuElements().forEach(button => {
        button.addEventListener('click', () => handleMenuClick(button));
    });

    leftSidebarView.onToggleSidebarClick(() => {
        const isHidden = leftSidebarView.toggleSidebar();
        layoutModel.updateState({ leftHidden: isHidden });
        layoutView.render(layoutModel.getState());

        leftSidebarView.showPanel(leftSidebarModel.getActivePanel());     
    });
}