import { layoutModel } from '../model/layoutModel.js';

import { layoutView } from '../view/layoutView.js';

import { leftSidebarController } from './leftSidebarController.js';
import { rightSidebarController } from './rightSidebarController.js';

let isResizing = null;
let startX, startLeft, startRight, startContent;

export const layoutController = {

    init() {
        layoutView.init();
        layoutView.render(layoutModel.restoreState());

        leftSidebarController.init();
        rightSidebarController.init();

        document.getElementById('left-resize-handle') // TODO selectors should be in the view
            .addEventListener('mousedown', e => startResizing(e, 'left'));

        document.getElementById('right-resize-handle')
            .addEventListener('mousedown', e => startResizing(e, 'right'));

        document.addEventListener('mouseup', stopResizing);       
    }
}

function startResizing(e, side) {
    e.preventDefault();
    isResizing = side;

    const state = layoutModel.getState();
    startX = e.clientX;
    startLeft = state.leftWidth;
    startRight = state.rightWidth;
    startContent = state.contentWidth;

    document.addEventListener('mousemove', resize);
}

function resize(e) {
    const deltaPercent = (e.clientX - startX) / window.innerWidth * 100;
    const state = layoutModel.getState();

    if (isResizing === 'left' && !state.leftHidden) {
        const newLeft = Math.max(layoutModel.getMinSidebarWidth(), startLeft + deltaPercent);
        const newContent = Math.max(layoutModel.getMinContentWidth(), startContent - deltaPercent);
        layoutModel.updateState({
            leftWidth: Math.round(newLeft),
            contentWidth: Math.round(newContent)
        });
    }

    if (isResizing === 'right' && !state.rightHidden) {
        const newRight = Math.max(layoutModel.getMinSidebarWidth(), startRight - deltaPercent);
        const newContent = Math.max(layoutModel.getMinContentWidth(), startContent + deltaPercent);
        layoutModel.updateState({
            rightWidth: Math.round(newRight),
            contentWidth: Math.round(newContent)
        });   
    }
    layoutView.render(layoutModel.getState());
}

function stopResizing() {
    isResizing = null;
    document.removeEventListener('mousemove', resize);
}
