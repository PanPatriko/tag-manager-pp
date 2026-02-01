
import { layoutModel } from '../model/layoutModel.js';

import { layoutView } from '../view/layoutView.js';
import { rightSidebarView } from '../view/rightSidebarView.js';

export const rightSidebarController = {

    init() {
        rightSidebarView.init();
        rightSidebarView.showPanel();

        rightSidebarView.onToggleSidebarClick(() => {
            const isHidden = rightSidebarView.toggleSidebar();

            layoutModel.updateState({ rightHidden: isHidden });
            const state = layoutModel.getState();
            layoutView.render(state);
        });
    }
}
