import { i18nModel } from "../model/i18nModel.js";
import { tagsModel } from "../model/tagsModel.js";
import { fileTagsModel } from "../model/fileTagsModel.js";
import { modalModel } from "../model/modalModel.js";
import { filesModel } from "../model/filesModel.js";

import { tagsView } from '../view/tagsView.js';
import { fileTagsModalView } from "../view/fileTagsModalView.js";
import { filesView } from "../view/filesView.js";

import { filePreviewController } from "./filePreviewController.js";

import { highlightText } from "../utils.js";

export const fileTagsModalController = {

    init() {
        fileTagsModalView.init();

        fileTagsModalView.onModalClick((event) => {
            fileTagsModalView.searchAutoFocus(event.target);
        });

        fileTagsModalView.onCloseModalClick(closeModal);

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
    },

    async openFileTagsModal() {
        const tagHierarchy = tagsModel.buildTagHierarchy();

        tagsView.renderTagTree({
            container: fileTagsModalView.getFileTagsTreeContainer(),
            tagHierarchy,
            childrenInitiallyVisible: true,
            onTagClick
        });

        fileTagsModalView.openModal();
    }
}

function closeModal() {
    modalModel.tagIds = [];
    fileTagsModalView.closeModal();
}

async function addTags() {
    const selectedFiles = filesModel.getSelectedFiles();

    if (modalModel.isTagIdsEmpty()) {
        showPopup(i18nModel.t('alert-no-tags-selected'), 'warning');
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.id;
        let filePath = file.path;

        if (fileId === 'null' || !fileId) {
            const createdFile = await filesModel.createFile(filePath);
            filesView.addIdToContainer(createdFile);
            fileId = createdFile.id;
        }

        for (const tagId of modalModel.tagIds) {
            try {
                await fileTagsModel.addFileTag(fileId, tagId);
            } catch (error) {
                console.error('addTags: error', error);
            }         
        }
    }

    await filePreviewController.renderFileInfo(filesModel.currentPreviewFile);
    closeModal();
}

async function removeTags() {
    const selectedFiles = filesModel.getSelectedFiles();

    if (modalModel.isTagIdsEmpty()) {
        showPopup(i18nModel.t('alert-no-tags-selected'), 'warning');
        return;
    }

    for (const file of selectedFiles) {
        let fileId = file.id;

        if (fileId != 'null' && fileId) {     
            for (const tagId of modalModel.tagIds) {
                try {
                    await fileTagsModel.deleteFileTag(fileId, tagId);
                } catch (error) {
                    console.error('removeTags: error', error);
            }   }   
        }
    }

    await filePreviewController.renderFileInfo(filesModel.currentPreviewFile);
    closeModal();
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