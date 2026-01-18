export const searchView = {

    tagsContainer: null,
    searchInput: null,
    searchButton: null,
    suggestions: null,

    init() {
        this.tagsContainer = document.getElementById('search-tags-container');
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.suggestions = document.getElementById('search-suggestions');
    },

    getSearchValue() {
        return this.searchInput.value.trim();
    },

    isTagInContainer(id, operation) {
        return this.tagsContainer.querySelector(
            `div[data-id="${id}"][data-operation="${operation}"]`
        );
    },

    isSearchTag(target) {
        return target.closest('.search-tag');
    },

    isSuggestionBtnClicked(target) {
        const btn = target.closest('.suggestion-button');
        if (!btn) return;

        const tagDiv = btn.closest('.suggestion-item');
        if (!tagDiv) return;

        const tag = tagDiv._tag;
        if (!tag) return;

        const operationName = btn.dataset.operation;

        if (this.isTagInContainer(tag.id, operationName)) {
            console.debug(`Tag with name "${tag.name}" (ID: "${tag.id}") and operation "${operationName}" already exists.`);
            return;
        }

        this.clearSearchBar();

        return { tag, operationName };
    },

    clearTagsContainer() {
        this.tagsContainer.innerHTML = '';
    },

    clearSuggestions() {
        this.suggestions.innerHTML = '';
    },

    clearSearchBar() {
        this.suggestions.innerHTML = '';
        this.searchInput.value = '';
    },

    removeSearchTag(tag) {
        this.tagsContainer.removeChild(tag);
    },

    disableSearch(disabled) {
        this.searchButton.disabled = disabled;
    },

    focusSearch() {
        this.searchInput.focus();
    },

    createSuggestion(tag, tagHierarchyDiv, buttonData) {
        const suggestionItem = createSuggestionItem(tag);
        suggestionItem.appendChild(tagHierarchyDiv);

        const buttonsContainer = createButtonsContainer();

        buttonData.forEach(data => {
            const button = createSuggestionButton(data.operation, data.title);
            buttonsContainer.appendChild(button);
        });

        suggestionItem.appendChild(buttonsContainer);
        this.suggestions.appendChild(suggestionItem);
    },

    addSearchTagToView(tag, tagOperation, titleText) {
        const tagDiv = document.createElement('div');

        tagDiv.className = `search-tag ${tagOperation.name}`;
        tagDiv.textContent = `${tagOperation.sign.toUpperCase()} ${tag.name}`;
        tagDiv.setAttribute('title', titleText);

        tagDiv.style.color = tag.textColor;
        tagDiv.style.backgroundColor = tag.color;

        tagDiv.dataset.tagName = tag.name;
        tagDiv.dataset.id = tag.id;
        tagDiv.dataset.operation = tagOperation.name;

        this.tagsContainer.appendChild(tagDiv);
        return tagDiv;
    },

    onSuggestionMouseEnter(handler) {
        this.suggestions.addEventListener('mouseenter', handler);
    },

    onSuggestionMouseLeave(handler) {
        this.suggestions.addEventListener('mouseleave', handler);
    },

    onSuggestionClick(handler) {
        this.suggestions.addEventListener('click', (e) => handler(e));
    },

    onTagsContainerClick(handler) {
        this.tagsContainer.addEventListener('click', (e) => handler(e));
    },

    onSearchClick(handler) {
        this.searchButton.addEventListener('click', handler);
    },

    onSearchFocusOut(handler) {
        this.searchInput.addEventListener('focusout', handler);
    },

    onSearchInput(handler) {
        this.searchInput.addEventListener('input', handler);
    }
}

function createSuggestionItem(tag) {
    const suggestionItem = document.createElement('li');
    suggestionItem.className = 'suggestion-item';
    suggestionItem._tag = tag;
    return suggestionItem;
}

function createButtonsContainer() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'suggestion-buttons';
    return buttonsContainer;
}

function createSuggestionButton(tagOperation, titleText) {
    const button = document.createElement('button');
    button.className = `suggestion-button ${tagOperation.name}`;
    button.textContent = tagOperation.sign;
    button.setAttribute('title', titleText);
    button.dataset.operation = tagOperation.name;
    return button;
}
