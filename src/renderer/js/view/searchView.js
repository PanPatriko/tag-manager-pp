export const searchView = {
    get searchInput() {
        return document.getElementById('search-input');
    },

    get searchButton() {
        return document.getElementById('search-button');
    },

    get tagsContainer() {
        return document.getElementById('search-tags-container');
    },

    get suggestions() {
        return document.getElementById('search-suggestions');
    },

    get tagsContainer() { 
        return document.getElementById('search-tags-container'); 
    },

    createSuggestionItem(tag) {
        const suggestionItem = document.createElement('li');
        suggestionItem.className = 'suggestion-item';
        suggestionItem._tag = tag;
        return suggestionItem;
    },

    createButtonsContainer() {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'suggestion-buttons';
        return buttonsContainer;
    },

    createSuggestionButton(tagOperation, titleText) {
        const button = document.createElement('button');
        button.className = `suggestion-button ${tagOperation.name}`;
        button.textContent = tagOperation.sign;
        button.setAttribute('title', titleText);
        button.dataset.operation = tagOperation.name; 
        //button.addEventListener('click', onClick);
        return button;
    },

    addSearchTagToView(tag, tagOperation, titleText) {
        const tagDiv = document.createElement('div');
        tagDiv.className = `search-tag ${tagOperation.name}`;
        tagDiv.textContent = `${tagOperation.sign.toUpperCase()} ${tag.name}`;
        tagDiv.setAttribute('title', titleText);
        tagDiv.style.color = tag.textcolor;
        tagDiv.style.backgroundColor = tag.color;
        tagDiv.dataset.tagName = tag.name;
        tagDiv.dataset.id = tag.id;
        tagDiv.dataset.operation = tagOperation.name;
        this.tagsContainer.appendChild(tagDiv);
        return tagDiv;
    },
}