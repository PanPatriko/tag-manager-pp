import { searchModel, TagOperation } from '../model/searchModel.js';
import { locationsModel } from "../model/locationsModel.js"
import { tagsModel } from '../model/tagsModel.js';
import { i18nModel } from '../model/i18nModel.js';

import { tagsView } from '../view/tagsView.js';
import { searchView } from '../view/searchView.js';

import { pushToHistory } from './historyController.js';

import { highlightText } from "../utils.js";
import { displayFiles } from "../content/content.js"

let isMouseOverSearchSuggestions = false;

function _onSuggestionButtonClick(tag, tagOperation) {

    const existingTag = searchView.tagsContainer.querySelector(
        `div[data-id="${tag.id}"][data-operation="${tagOperation.name}"]`
    );
    if (existingTag) {
        console.warn(`Tag with name "${tag.name}" (ID: "${tag.id}") and operation "${tagOperation.name}" already exists.`);
        return;
    }


    const tagTitle = tagsView.renderTagHierarchyString(
        tagsModel.buildSingleTagHierarchy(tag));

    searchView.addSearchTagToView(tag, tagOperation, tagTitle);
    searchModel.addTag(tag.id, tagOperation.name);


    searchView.suggestions.innerHTML = '';
    searchView.searchInput.value = '';
    isMouseOverSearchSuggestions = false;
}

export function restoreSearchTags(andTags, orTags, notTags) {
    searchModel.updateTags(andTags, orTags, notTags);

    searchView.tagsContainer.innerHTML = '';

    function _restoreTag (tagId, tagOperation) {
        const tag = tagsModel.tags.find(t => t.id === tagId);

        const tagTitle = tagsView.renderTagHierarchyString(
            tagsModel.buildSingleTagHierarchy(tag));

        searchView.addSearchTagToView(tag, tagOperation, tagTitle);
    } 

    andTags.forEach(tagId => {
        _restoreTag(tagId, TagOperation.AND)
    });
    orTags.forEach(tagId => {
        _restoreTag(tagId, TagOperation.OR)
    });
    notTags.forEach(tagId => {
        _restoreTag(tagId, TagOperation.NOT)
    });
}

export async function searchFiles() {   
    document.getElementById('parent-directory').disabled = true;
    document.getElementById('dir-name').classList.add('hidden');
    locationsModel.currentDirectory = null;
    await searchModel.searchFiles();
    displayFiles();
}

export async function initSearch() {

    searchView.searchInput.addEventListener('input', function() {
        const query = searchView.searchInput.value.trim().toLowerCase();
        searchView.suggestions.innerHTML = '';
        if (query.length > 0) {
            const filteredTags = tagsModel.searchTags(query, 'startsWith');
            filteredTags.forEach(tag => {
                const suggestionItem = searchView.createSuggestionItem(tag);

                const div = tagsView.renderTagHierarchyDiv(tagsModel.buildSingleTagHierarchy(tag));
                suggestionItem.appendChild(div);
    
                const buttonsContainer = searchView.createButtonsContainer();
                
                const andTitle = i18nModel.t(`title-${TagOperation.AND.name}-button`);
                const andButton = searchView.createSuggestionButton(TagOperation.AND, andTitle);

                const orTitle = i18nModel.t(`title-${TagOperation.OR.name}-button`);
                const orButton = searchView.createSuggestionButton(TagOperation.OR, orTitle);

                const notTitle = i18nModel.t(`title-${TagOperation.NOT.name}-button`);
                const notButton = searchView.createSuggestionButton(TagOperation.NOT, notTitle);
    
                buttonsContainer.appendChild(andButton);
                buttonsContainer.appendChild(orButton);
                buttonsContainer.appendChild(notButton);    
                
                suggestionItem.appendChild(buttonsContainer);
                searchView.suggestions.appendChild(suggestionItem);
            });
            highlightText(query, 'search-suggestions', 'li span:last-child');
        }
    });

    searchView.searchInput.addEventListener('focusout', function() {
        if (!isMouseOverSearchSuggestions) {
            searchView.suggestions.innerHTML = '';
            searchView.searchInput.value = '';
        } else {
            searchView.searchInput.focus();
        }
    });

    searchView.searchButton.addEventListener('click', () => { 
        pushToHistory(searchModel.getHistoryRecord());
        searchFiles();
    });

    searchView.suggestions.addEventListener('mouseenter', () => {
        isMouseOverSearchSuggestions = true;
    });

     searchView.suggestions.addEventListener('mouseleave', () => {
        isMouseOverSearchSuggestions = false;
    });

    searchView.tagsContainer.addEventListener('click', (event) => {
        const tagDiv = event.target.closest('.search-tag');
        if (tagDiv && searchView.tagsContainer.contains(tagDiv)) {
            const tagId = parseInt(tagDiv.dataset.id);
            const operation = tagDiv.dataset.operation;
            searchView.tagsContainer.removeChild(tagDiv);
            searchModel.removeTag(tagId, operation);
        }
    });

    searchView.suggestions.addEventListener('click', (event) => {
        const btn = event.target.closest('.suggestion-button');
        if (!btn) return;

        const operationName = btn.dataset.operation;
        const tagDiv = btn.closest('.suggestion-item');
        if (!tagDiv) return;

        const tag = tagDiv._tag;
        if (!tag) return;

        _onSuggestionButtonClick(tag, TagOperation[operationName.toUpperCase()]);
    });
}