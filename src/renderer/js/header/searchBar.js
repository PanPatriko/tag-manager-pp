import { setFiles } from "../state.js"
import { highlightText } from "../utils.js";
import { displayFiles } from "../content/content.js"
import { pushToHistory } from "../content/pagination.js"

import { locationsModel } from "../model/locationsModel.js"
import { tagsView } from '../view/tagsView.js';
import { tagsModel } from '../model/tagsModel.js';
import { i18nModel } from "../model/i18nModel.js";

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchTagsContainer = document.getElementById('search-tags-container');
const searchSuggestions = document.getElementById('search-suggestions');

let isMouseOverSearchSuggestions = false;

const andTagSign = '+';
const orTagSign = '||';
const notTagSign = '–';

const andTagOperation = 'and';
const orTagOperation = 'or';
const notTagOperation = 'not';

let andTags = [];
let orTags = [];
let notTags = [];

searchInput.addEventListener('input', function() { // controller todo
    const query = searchInput.value.trim().toLowerCase();
    searchSuggestions.innerHTML = '';
    if (query.length > 0) {
        const filteredTags = tagsModel.searchTags(query, 'startsWith');
        filteredTags.forEach(tag => {
            const suggestionItem = document.createElement('li');
            const div = tagsView.buildTagHierarchyDiv(tagsModel.buildSingleTagHierarchy(tag));
            suggestionItem.className = 'suggestion-item';

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'suggestion-buttons';

            const andButton = createSuggestionButton(andTagSign, andTagOperation, tag);
            const orButton = createSuggestionButton(orTagSign, orTagOperation, tag);
            const notButton = createSuggestionButton(notTagSign, notTagOperation, tag);

            buttonsContainer.appendChild(andButton);
            buttonsContainer.appendChild(orButton);
            buttonsContainer.appendChild(notButton);

            suggestionItem.appendChild(div);
            suggestionItem.appendChild(buttonsContainer);
            searchSuggestions.appendChild(suggestionItem);
        });
        highlightText(query, 'search-suggestions', 'li span:last-child');
    }
});

searchSuggestions.addEventListener('mouseenter', () => { // ctrl 
    isMouseOverSearchSuggestions = true;
});

searchSuggestions.addEventListener('mouseleave', () => { // ctrl
    isMouseOverSearchSuggestions = false;
});

searchInput.addEventListener('focusout', function() { // ctrl todo
    if (!isMouseOverSearchSuggestions) {
        searchSuggestions.innerHTML = '';
        searchInput.value = '';
    } else {
        searchInput.focus();
    }
});

searchButton.addEventListener('click', async function() { // controller
    pushToHistory({
        type: 'search',
        andTags: [...andTags],
        orTags: [...orTags],
        notTags: [...notTags]
    });
    searchFiles(andTags, orTags, notTags);
});

export async function searchFiles(andTags, orTags, notTags) { // model, ctrl todo, view todo
    const newFiles = await window.api.searchFiles(andTags, orTags, notTags);
    locationsModel.currentDirectory = null;
    setFiles(newFiles);  
    displayFiles();
    document.getElementById('parent-directory').disabled = true;
    document.getElementById('dir-name').classList.add('hidden');
}

export function displaySearchTags(newAndTags, newOrTags, newNotTags) { // view todo
    searchTagsContainer.innerHTML = '';

    andTags = [];
    orTags = [];
    notTags = [];

    newAndTags.forEach(tagId => {
        addSearchTag(tagId, andTagSign, andTagOperation);
    });
    newOrTags.forEach(tagId => {
        addSearchTag(tagId, orTagSign, orTagOperation);
    });
    newNotTags.forEach(tagId => {
        addSearchTag(tagId, notTagSign, notTagOperation);
    });
}

function createSuggestionButton(operationSign, operation, tag) { // view todo
    const button = document.createElement('button');
    button.className = `suggestion-button ${operation}`;
    button.textContent = operationSign;
    button.setAttribute('title', i18nModel.t(`title-${operation}-button`));
    button.addEventListener('click', function() {
        addSearchTag(tag.id, operationSign, operation);
        searchSuggestions.innerHTML = '';
        searchInput.value = '';
        isMouseOverSearchSuggestions = false;
    });
    return button;
}

function addSearchTag(tagID, operationSign, operation) { //view todo
    const tag = tagsModel.tags.find(t => t.id === tagID);
    if (!tag) {
        console.warn(`Tag with ID "${tagID}" not found.`);
        return;
    }

    const existingTag = searchTagsContainer.querySelector(`div[data-id="${tag.id}"][data-operation="${operation}"]`);
    if (existingTag) {
        console.warn(`Tag with name "${tag.name}" (ID: "${tag.id}") and operation "${operation}" already exists.`);
        return;
    }

    const tagDiv = document.createElement('div');
    tagDiv.className = `search-tag ${operation}`;
    tagDiv.textContent = `${operationSign.toUpperCase()} ${tag.name}`;
    tagDiv.setAttribute('title', tagsView.buildTagHierarchyString(tagsModel.buildSingleTagHierarchy(tag)));
    tagDiv.style.color =  tag.textcolor;
    tagDiv.style.backgroundColor = tag.color;
    tagDiv.dataset.tagName = tag.name;
    tagDiv.dataset.id = tag.id;
    tagDiv.dataset.operation = operation;
    tagDiv.addEventListener('click', function() {
        searchTagsContainer.removeChild(tagDiv);
        removeTag(tag.id, operation);
    });
    searchTagsContainer.appendChild(tagDiv);
    addTag(tag.id, operation);
}

function addTag(tagId, operation) { // model
    switch (operation) {
        case andTagOperation:
            andTags.push(tagId);
            break;
        case orTagOperation:
            orTags.push(tagId);
            break;
        case notTagOperation:
            notTags.push(tagId);
            break;
    }
}

function removeTag(tagId, operation) {   // model
    switch (operation) {
        case andTagOperation:
            andTags = andTags.filter(tag => tag !== tagId);
            break;
        case orTagOperation:
            orTags = orTags.filter(tag => tag !== tagId);
            break;
        case notTagOperation:
            notTags = notTags.filter(tag => tag !== tagId);
            break;
    }
}