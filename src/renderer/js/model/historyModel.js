const MAX_HISTORY = 10;
let history = [];
let historyIndex = -1;

function _getCurrentHistory() {
    if (historyIndex >= 0 && historyIndex < history.length) {
        return history[historyIndex];
    }
    return null;
}

function _goTo(index) {
    if (index >= 0 && index < history.length) {
        historyIndex = index;
        return _getCurrentHistory();
    }
    return null;
}

export const historyModel = {
    get history() { return history; },

    get historyIndex() { return historyIndex; },
    set historyIndex(newIndex) { historyIndex = newIndex; },

    canGoBack() {
        return this.historyIndex > 0;
    },

    canGoForward() {
        return this.historyIndex < this.history.length - 1;
    },

    goBack() {
        return this.canGoBack() ? _goTo(this.historyIndex - 1) : null;
    },

    goForward() {
        return this.canGoForward() ? _goTo(this.historyIndex + 1) : null;
    },

    pushToHistory(record) {
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        history.push(record);
        // Remove oldest if over MAX_HISTORY
        if (history.length > MAX_HISTORY) {
            history.shift();
            // Adjust historyIndex if it was not at the end
            if (historyIndex > 0) {
                historyIndex--;
            }
        }
        historyIndex = history.length - 1;
    }
};