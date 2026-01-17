import { tagsModel, TagType } from '../model/tagsModel.js';

import { tagsView, TagClass } from '../view/tagsView.js';

export const tagsController = {

    async init() {
        await tagsModel.getTagsFromDB();

        this.refreshTagsContainer();

        tagsView.onTagsContainerClick((event) => {
            const tag = tagsView.isTagItem(event.target);
            if (tag) {
                onTagItemClick(tag, TagType.EXPANDED_TAGS, TagClass.TAG_ITEM);
            }
        });

        tagsView.onFileTagsContainerClick((event) => {
            const fileTag = tagsView.isFileTagItem(event.target);
            if (fileTag) {
                onTagItemClick(fileTag, TagType.EXPANDED_FILE_TAGS, TagClass.FILE_TAG_ITEM);
            }
        });
    },

    refreshTagsContainer() {
        const tagHierarchy = tagsModel.buildTagHierarchy();

        tagsView.renderTagTree({
            container: tagsView.getTagsContainer(),
            tagHierarchy,
            tagClass: TagClass.TAG_ITEM,
            childrenInitiallyVisible: false
        });

        tagsView.applyExpandedTags(
            tagsModel.getExpandedTags(TagType.EXPANDED_TAGS),
            TagClass.TAG_ITEM
        );
    }
}

function onTagItemClick(tag, tagType, tagItem) {
    const tagId = tagsView.getTagItemId(tag);
    const expandedTags = tagsModel.getExpandedTags(tagType);

    if (tagsView.expandTagItem(tag)) {
        expandedTags.push(tagId);
    } else {
        const index = expandedTags.indexOf(tagId);
        if (index !== -1) expandedTags.splice(index, 1);
    }

    tagsModel.setExpandedTags(tagType, expandedTags);
    tagsView.applyExpandedTags(expandedTags, tagItem)
}
