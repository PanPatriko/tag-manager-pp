import { highlightText } from "../utils.js";
import { getSelectedFiles } from "../content/content.js";
import { refreshFileInfo } from "../rightSidebar/fileInfo.js";

import { tagsModel } from "../model/tagsModel.js";
import { fileTagsModel } from "../model/fileTagsModel.js";
import { modalModel } from "../model/modalModel.js";
import { filesModel } from "../model/filesModel.js";

import { tagsView } from '../view/tagsView.js';
import { fileTagsModalView } from "../view/fileTagsModalView.js";

async function addTags() {
    const selectedFiles = getSelectedFiles();

    if (modalModel.isTagIdsEmpty()) {
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;
        let filePath = file.dataset.path;

        if (fileId === 'null') {
            const fileName = filePath.split('\\').pop();
            await window.api.createFile({ name: fileName, path: filePath });
            const newFile = await window.api.getFileByPath(filePath);
            fileId = newFile.id;
            file.dataset.id = fileId;
            filesModel.files.find(f => f.path === filePath).id = fileId;
        }

        for (const tagId of modalModel.tagIds) {
            try {
                await fileTagsModel.addFileTag(fileId, tagId);
            } catch (error) {
                console.error(error);
            }         
        }
    }

    await refreshFileInfo();
}

async function removeTags() {
    const selectedFiles = getSelectedFiles(); 

    if (modalModel.isTagIdsEmpty()) {
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;

        if (fileId != 'null') {     
            for (const tagId of modalModel.tagIds) {
                try {
                    await fileTagsModel.deleteFileTag(fileId, tagId);
                } catch (error) {
                    console.error(error);
            }   }   
        }
    }

    await refreshFileInfo();
}

function onTagClick(tag) {
    if (modalModel.canAddTag(tag.id)) {
        modalModel.addTagId(tag.id)
        fileTagsModalView.addTag(tag);
    }
    fileTagsModalView.searchFocus();
}

function tagsSearch() {
    const query = fileTagsModalView.getSearchValue();
    const foundTags = tagsModel.searchTags(query, 'include');
    let completeTags = tagsModel.addMissingParentTags(foundTags);

    if (fileTagsModalView.isShowChildTagsChecked()) { //
        completeTags = tagsModel.addMissingChildTags(completeTags, query);
    }

    const tagHierarchy = tagsModel.buildTagHierarchy(completeTags);
    tagsView.renderTagTree({
        container: fileTagsModalView.getFileTagsTreeContainer(),
        tagHierarchy,
        childrenInitiallyVisible: true,
        onTagClick     
    });   
    highlightText(query, 'modal-file-tags-tree', 'li span');
}

export async function openFileTagsModal() {
    const tagHierarchy = tagsModel.buildTagHierarchy();
    tagsView.renderTagTree({
        container: fileTagsModalView.getFileTagsTreeContainer(),
        tagHierarchy,
        childrenInitiallyVisible: true,
        onTagClick
    });
    
    fileTagsModalView.openModal();
}

export function initFileTagsModal() {

    fileTagsModalView.onModalClick((event) => {
        fileTagsModalView.searchAutoFocus(event.target);
    });

    fileTagsModalView.onCloseModalClick(() => {
        modalModel.tagIds = [];
        fileTagsModalView.closeModal();
    });

    fileTagsModalView.onAddTagsClick(addTags);

    fileTagsModalView.onRemoveTagsClick(removeTags);

    fileTagsModalView.onSearchInput(tagsSearch);

    fileTagsModalView.onShowChildTagsChange(tagsSearch);

    fileTagsModalView.onTagsContainerClick((event) => {
        const target = event.target;
        if (fileTagsModalView.isTagClicked(target)) {
            modalModel.removeTagId(parseInt(target.dataset.id));
            fileTagsModalView.removeTag(target);
        }        
    });

}