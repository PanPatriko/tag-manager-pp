import { leftSidebarModel } from '../model/leftSidebarModel.js';
import { layoutModel } from '../model/layoutModel.js';

import { leftSidebarView } from '../view/leftSidebarView.js';
import { layoutView } from '../view/layoutView.js';

export const leftSidebarController = {

    init() {
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
}

function handleMenuClick(button) {
    leftSidebarModel.setActivePanel(button.dataset.panel);
    leftSidebarView.showPanel(button.dataset.panel);
}
