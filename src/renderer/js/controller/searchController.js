import { searchModel, TagOperation } from '../model/searchModel.js';
import { locationsModel } from "../model/locationsModel.js"
import { tagsModel } from '../model/tagsModel.js';
import { i18nModel } from '../model/i18nModel.js';

import { tagsView } from '../view/tagsView.js';
import { searchView } from '../view/searchView.js';
import { paginationView } from '../view/paginationView.js';

import { pushToHistory } from './historyController.js';

import { highlightText } from "../utils.js";
import { displayFiles } from "../content/content.js"

let isMouseOverSearchSuggestions = false;

function addTag(tag, tagOperation) {
    const tagTitle = tagsView.renderTagHierarchyString(
        tagsModel.buildSingleTagHierarchy(tag));

    searchModel.addTag(tag.id, tagOperation.name);
    searchView.addSearchTagToView(tag, tagOperation, tagTitle);
} 

export function restoreSearchTags(andTags, orTags, notTags) {
    searchModel.clearTags();
    searchView.clearTagsContainer();

    andTags.forEach(tagId => {
        const tag = tagsModel.findTagById(tagId);
        addTag(tag, TagOperation.AND)
    });
    orTags.forEach(tagId => {
        const tag = tagsModel.findTagById(tagId);
        addTag(tag, TagOperation.OR)
    });
    notTags.forEach(tagId => {
        const tag = tagsModel.findTagById(tagId);
        addTag(tag, TagOperation.NOT)
    });
}

export async function searchFiles() {  
    searchView.disableSearch(true);
    
    locationsModel.currentDirectory = null;

    paginationView.hideDirectoryName();
    paginationView.disableParentDir(true);
    
    await searchModel.searchFiles();
    await displayFiles();

    searchView.disableSearch(false);
}

export async function initSearch() {
    searchView.onSearchInput(() => {
        searchView.clearSuggestions();

        const query = searchView.getSearchValue();      
        if (query.length > 0) {

            const buttonData = [
                { operation: TagOperation.AND, title: i18nModel.t(`title-${TagOperation.AND.name}-button`) },
                { operation: TagOperation.OR, title: i18nModel.t(`title-${TagOperation.OR.name}-button`) },
                { operation: TagOperation.NOT, title: i18nModel.t(`title-${TagOperation.NOT.name}-button`) }
            ];
            
            const filteredTags = tagsModel.searchTags(query, 'startsWith');
            filteredTags.forEach(tag => {
                const tagHierarchyDiv = tagsView.renderTagHierarchyDiv(
                                        tagsModel.buildSingleTagHierarchy(tag));

                searchView.createSuggestion(tag, tagHierarchyDiv, buttonData)
            });
            highlightText(query, 'search-suggestions', 'li span:last-child');
        }
    });

    searchView.onSearchFocusOut(() => {
        if (isMouseOverSearchSuggestions) {
            searchView.focusSearch();
        } else {
            searchView.clearSearchBar();
        }
    });

    searchView.onSearchClick(() => { 
        searchFiles();
        pushToHistory(searchModel.createHistoryRecord());
    });

    searchView.onTagsContainerClick((event) => {
        const tagDiv = searchView.isSearchTag(event.target);

        if (tagDiv) {
            const id = parseInt(tagDiv.dataset.id);
            const operation = tagDiv.dataset.operation;

            searchModel.removeTag(id, operation);
            searchView.removeSearchTag(tagDiv);
        }
    });

    searchView.onSuggestionMouseEnter(() => {
        isMouseOverSearchSuggestions = true;
    });

    searchView.onSuggestionMouseLeave(() => {
        isMouseOverSearchSuggestions = false;
    });

    searchView.onSuggestionClick((event) => {
        const data = searchView.isSuggestionBtnClicked(event.target);

        if(data) {
            addTag(data.tag, TagOperation[data.operationName.toUpperCase()])
            isMouseOverSearchSuggestions = false;
        }
    });
}