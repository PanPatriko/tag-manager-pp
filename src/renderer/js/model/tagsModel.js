let tags = [];
let copiedTags = [];

export const tagsModel = { 

    get tags() { return tags;},
    set tags(newTags) { tags = newTags; },

    get copiedTags() { return copiedTags; },
    set copiedTags(tags) { copiedTags = tags; },

    async getTagsFromDB() { 
        const rawTags = await window.api.getTags();
        tags = rawTags.map(record => new Tag(record));
        if (!Array.isArray(tags)) {
            console.error('getTagsFromDB: window.api.getTags() did not return an array', tags);
            tags = [];
        }
        return tags;
    },

    async createTag(name, parent_id, color, textcolor) {
        const tagData = { name, parent_id, color, textcolor };
        const newTag = await window.api.createTag(tagData);
        tags.push(new Tag(newTag));
    },

    async updateTag(id, name, parent_id, color, textcolor) {
        const tagData = { id, name, parent_id, color, textcolor };
        await window.api.updateTag(id, tagData);
        const index = tags.findIndex(tag => tag.id === id);
        if (index !== -1) {
            tags[index] = new Tag(tagData);
        }
    },     

    async deleteTag(tagId) {
        await window.api.deleteTag(tagId);
        tags = tags.filter(tag => tag.id !== tagId);
    },

    getExpandedTags(tagType) {
        const expandedTags = localStorage.getItem(tagType);
        return expandedTags ? JSON.parse(expandedTags) : [];
    },

    setExpandedTags(tagType, tagIds) {
        localStorage.setItem(tagType, JSON.stringify(tagIds));
    },

    isDescendantTag(tag, tagToCompare) {
        if (!tag || !tagToCompare) return false;
        if (!tag.children) return false;
        if (tagToCompare.isChildOf(tag.id)) return true;      
        return tag.children.some(tag => this.isDescendantTag(tag, tagToCompare));
    },

    findTagById(id) {
        return tags.find(tag => tag.id === id);
    },

    searchTags(query, mode) {
        const lowerCaseQuery = query.toLowerCase();
        if (mode === '1') {
            return tags.filter(tag => tag.name.toLowerCase().startsWith(lowerCaseQuery));
        } else if (mode === '2') {
            return tags.filter(tag => tag.name.toLowerCase().includes(lowerCaseQuery));
        } else if (mode === '3') {
            return tags.filter(tag => tag.name.toLowerCase() === lowerCaseQuery);
        } else {
            console.warn(`Unknown search mode: ${mode}`);
            return [];
        }
    },
    
    buildTagHierarchy(tags = null) {
        if(!tags) {
            tags = this.tags;
        }

        const tagMap = new Map();
        tags.forEach(tag => {
            tag.children = [];
            tagMap.set(tag.id, tag);
        });

        const hierarchy = [];
        tags.forEach(tag => {
            if (tag.parentId) {
                const parent = tagMap.get(tag.parentId);
                if (parent) {
                    parent.children.push(tag);
                }
            } else {
                hierarchy.push(tag);
            }
        });

        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        function sortTagsByName(tags) {         
            tags.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return collator.compare(nameA, nameB);
            });
            tags.forEach(tag => {
                if (tag.children.length > 0) {
                    sortTagsByName(tag.children);
                }
            });
        }

        sortTagsByName(hierarchy);

        return hierarchy;
    },

    buildSingleTagHierarchy(tag) {
        const hierarchy = [];
        let currentTag = tag;
    
        while (currentTag) {
            hierarchy.unshift(currentTag);
            currentTag = this.findTagById(currentTag.parentId);
        }
    
        return hierarchy;
    },

    addMissingParentTags(fileTags) {
        const completeTags = [...fileTags];
        const tagIds = new Set(fileTags.map(tag => tag.id));

        for (const tag of fileTags) {
            let parentId = tag.parentId;
            while (parentId && !tagIds.has(parentId)) {
                const parentTag = this.findTagById(parentId);
                if (parentTag) {
                    completeTags.push(parentTag);
                    tagIds.add(parentTag.id);
                    parentId = parentTag.parentId;
                } else {
                    break;
                }
            }
        }
        return completeTags;
    },

    addMissingChildTags(fileTags, query) {
        const completeTags = [...fileTags];
        const tagIds = new Set(fileTags.map(tag => tag.id));

        function addChildren(tag) {
            const childTags = tags.filter(t => t.parentId === tag.id);
            for (const childTag of childTags) {
                if (!tagIds.has(childTag.id)) {
                    completeTags.push(childTag);
                    tagIds.add(childTag.id);
                    addChildren(childTag);
                }
            }
        }

        for (const tag of fileTags) {
            if (tag.name.toLowerCase().includes(query.toLowerCase())) {
                addChildren(tag);
            }
        }

        return completeTags;
    }
}

export const TagType = Object.freeze({
    EXPANDED_FILE_TAGS: 'expandedFileTags',
    EXPANDED_TAGS: 'expandedTags'
});

export class Tag {
  constructor({ id, name, parent_id = null, color, textcolor }) {
    this.id = id;
    this.parentId = parent_id;
    this.name = name;
    this.color = color;
    this.textColor = textcolor;
  }

  get cssStyle() {
    return `color: ${this.textColor}; background: ${this.color}`;
  }

  isChildOf(parentId) {
    return this.parentId === parentId;
  }

}