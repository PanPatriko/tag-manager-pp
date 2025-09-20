import { filesModel } from './filesModel.js';

let andTags = [];
let orTags = [];
let notTags = [];

export const TagOperation = {
    AND:   { name: 'and', sign: '+' },
    OR:    { name: 'or',  sign: '||' },
    NOT:   { name: 'not', sign: '–' }
};

export const searchModel = {  

    async searchFiles() {
        const files = await window.api.searchFiles(andTags, orTags, notTags);
        filesModel.files = files;
        return files;
    },

    createHistoryRecord() {
        return {
            type: 'search',
            andTags: [...andTags],
            orTags: [...orTags],
            notTags: [...notTags]
        }
    },

    clearTags() {
        andTags = [];
        orTags = [];
        notTags = [];
    },

    addTag(tagId, operation) {
        switch (operation) {
            case TagOperation.AND.name:
                andTags.push(tagId);
                break;
            case TagOperation.OR.name:
                orTags.push(tagId);
                break;
            case TagOperation.NOT.name:
                notTags.push(tagId);
                break;
        }
    },

    removeTag(tagId, operation) {   
        switch (operation) {
            case TagOperation.AND.name:
                andTags = andTags.filter(tag => tag !== tagId);
                break;
            case TagOperation.OR.name:
                orTags = orTags.filter(tag => tag !== tagId);
                break;
            case TagOperation.NOT.name:
                notTags = notTags.filter(tag => tag !== tagId);
                break;
        }
    }

};