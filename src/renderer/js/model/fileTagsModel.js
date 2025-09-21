import { Tag } from './tagsModel.js'

export const fileTagsModel = { 
    
    async addFileTag(fileId, tagId) { 
        await window.api.addFileTag(fileId, tagId); 
    },

    async getFileTags(fileId) { 
        const tags = await window.api.getFileTags(fileId);
        const fileTags = tags.map(record => new Tag(record));
        return fileTags;
    }, 

    async deleteFileTag(fileId, tagId) {
        await window.api.deleteFileTag(fileId, tagId);
    }
}