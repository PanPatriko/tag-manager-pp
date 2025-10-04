const MIN_SIDEBAR_WIDTH = 10;
const MIN_CONTENT_WIDTH = 15;

let state = {
    leftWidth: 20,
    rightWidth: 20,
    leftHidden: false,
    rightHidden: false,
};

function normalizeWidths() {
    
    if (state.leftHidden && state.rightHidden) {
        // contentWidth will be 100 in getState()
        return;
    }
    if (state.leftHidden) {
        // Ensure rightWidth is within bounds
        if (state.rightWidth < MIN_SIDEBAR_WIDTH) state.rightWidth = MIN_SIDEBAR_WIDTH;
        if (state.rightWidth > 100 - MIN_CONTENT_WIDTH) state.rightWidth = 100 - MIN_CONTENT_WIDTH;
        // contentWidth will be 100 - rightWidth
        return;
    }
    if (state.rightHidden) {
        // Ensure leftWidth is within bounds
        if (state.leftWidth < MIN_SIDEBAR_WIDTH) state.leftWidth = MIN_SIDEBAR_WIDTH;
        if (state.leftWidth > 100 - MIN_CONTENT_WIDTH) state.leftWidth = 100 - MIN_CONTENT_WIDTH;
        // contentWidth will be 100 - leftWidth
        return;
    }

    // Ensure sidebars are not too small
    if (state.leftWidth < MIN_SIDEBAR_WIDTH) state.leftWidth = MIN_SIDEBAR_WIDTH;
    if (state.rightWidth < MIN_SIDEBAR_WIDTH) state.rightWidth = MIN_SIDEBAR_WIDTH;

    // Ensure content is not too small
    let contentWidth = 100 - state.leftWidth - state.rightWidth;
    if (contentWidth < MIN_CONTENT_WIDTH) {
        // Reduce sidebars proportionally if possible
        const excess = MIN_CONTENT_WIDTH - contentWidth;
        // Try to reduce both sidebars equally
        let reduceLeft = Math.min(excess / 2, state.leftWidth - MIN_SIDEBAR_WIDTH);
        let reduceRight = Math.min(excess / 2, state.rightWidth - MIN_SIDEBAR_WIDTH);

        state.leftWidth -= reduceLeft;
        state.rightWidth -= reduceRight;

        // Recalculate contentWidth after reduction
        contentWidth = 100 - state.leftWidth - state.rightWidth;
        // If still not enough, reduce left or right further if possible
        if (contentWidth < MIN_CONTENT_WIDTH) {
            if (state.leftWidth > MIN_SIDEBAR_WIDTH) {
                let more = Math.min(MIN_CONTENT_WIDTH - contentWidth, state.leftWidth - MIN_SIDEBAR_WIDTH);
                state.leftWidth -= more;
            } else if (state.rightWidth > MIN_SIDEBAR_WIDTH) {
                let more = Math.min(MIN_CONTENT_WIDTH - contentWidth, state.rightWidth - MIN_SIDEBAR_WIDTH);
                state.rightWidth -= more;
            }
        }
    }
}

function saveState() {
    localStorage.setItem('layoutState', JSON.stringify(state));
}

export const layoutModel = { 

    getMinSidebarWidth() {
        return MIN_SIDEBAR_WIDTH;
    },

    getMinContentWidth() {
        return MIN_CONTENT_WIDTH;
    },

    getState() {
        let leftWidth = state.leftHidden ? 0 : state.leftWidth;
        let rightWidth = state.rightHidden ? 0 : state.rightWidth;
        let contentWidth = 100 - leftWidth - rightWidth;
        return {
            ...state,
            leftWidth,
            rightWidth,
            contentWidth
        };
    },

    updateState(newState) {
        state = { ...state, ...newState };
        normalizeWidths();
        saveState();
    },

    restoreState() {
        const saved = JSON.parse(localStorage.getItem('layoutState'));
        if (saved) {
            state = { ...state, ...saved };
            normalizeWidths();
        }
        return this.getState();
    }
}
