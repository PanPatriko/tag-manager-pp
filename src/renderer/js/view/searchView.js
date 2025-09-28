const tagsContainer = document.getElementById('search-tags-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const suggestions = document.getElementById('search-suggestions');

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

export const searchView = {

    getSearchValue() {
        return searchInput.value.trim();
    },

    isTagInContainer(id, operation) {
        return tagsContainer.querySelector(
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
        tagsContainer.innerHTML = '';
    },

    clearSuggestions() {
        suggestions.innerHTML = '';
    },

    clearSearchBar() {
        suggestions.innerHTML = '';
        searchInput.value = '';
    },

    removeSearchTag(tag) {
        tagsContainer.removeChild(tag);
    },

    disableSearch(disabled) {
        searchButton.disabled = disabled;
    },

    focusSearch() {
        searchInput.focus();
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
        suggestions.appendChild(suggestionItem);
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

        tagsContainer.appendChild(tagDiv);
        return tagDiv;
    },

    onSuggestionMouseEnter(handler) {
        suggestions.addEventListener('mouseenter', handler);
    },

    onSuggestionMouseLeave(handler) {
        suggestions.addEventListener('mouseleave', handler);
    },

    onSuggestionClick(handler) {
        suggestions.addEventListener('click', (e) => handler(e));
    },

    onTagsContainerClick(handler) {
        tagsContainer.addEventListener('click', (e) => handler(e));
    },

    onSearchClick(handler) {
        searchButton.addEventListener('click', handler);
    },

    onSearchFocusOut(handler) {
        searchInput.addEventListener('focusout', handler);
    },

    onSearchInput(handler) {
        searchInput.addEventListener('input', handler);
    },
}