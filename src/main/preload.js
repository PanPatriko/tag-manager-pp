
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // tags.js
    getTags: () => ipcRenderer.invoke('dbtags:get-tags'),
    getTagById: (id) => ipcRenderer.invoke('dbtags:get-tag-by-id', id),
    createTag: (tagData) => ipcRenderer.invoke('dbtags:create-tag', tagData),
    updateTag: (id, tagData) => ipcRenderer.invoke('dbtags:update-tag', id, tagData),
    deleteTag: (id) => ipcRenderer.invoke('dbtags:delete-tag', id),

    // files.js
    getFiles: () => ipcRenderer.invoke('dbfiles:get-files'),
    getFileById: (id) => ipcRenderer.invoke('dbfiles:get-file-by-id', id),
    getFileByPath: (path) => ipcRenderer.invoke('dbfiles:get-file-by-path', path),
    createFile: (fileData) => ipcRenderer.invoke('dbfiles:create-file', fileData),
    searchFiles: (andTags, orTags, notTags) => ipcRenderer.invoke('dbfiles:search-files', andTags, orTags, notTags),
    updateFile: (fileId, newFileName, oldFilePath) => ipcRenderer.invoke('dbfiles:update-file', fileId, newFileName, oldFilePath),
    deleteFileById: (id) => ipcRenderer.invoke('dbfiles:delete-file', id),

    // filetags.js
    getFileTags: (fileId) => ipcRenderer.invoke('dbfiletags:get-file-tags', fileId),
    addFileTag: (fileId, tagId) => ipcRenderer.invoke('dbfiletags:add-file-tag', fileId, tagId),
    deleteFileTag: (fileId, tagId) => ipcRenderer.invoke('dbfiletags:delete-file-tag', fileId, tagId),

    // locations.js
    getLocations: () => ipcRenderer.invoke('dblocations:get-locations'),
    addLocation: (locationData) => ipcRenderer.invoke('dblocations:add-location', locationData),
    updateLocation: (locationData) => ipcRenderer.invoke('dblocations:update-location', locationData),
    deleteLocation: (locationId) => ipcRenderer.invoke('dblocations:delete-location', locationId),

    path: {
        join: (...args) => ipcRenderer.invoke('path-join', ...args),
        dirname: (p) => ipcRenderer.invoke('path-dirname', p),
        basename: (p, ext) => ipcRenderer.invoke('path-basename', p, ext),
        extname: (p) => ipcRenderer.invoke('path-extname', p)
    },

    openExt: async (path) => await ipcRenderer.invoke('ext:open-ext', path),
    openExplorer: async (path) => await ipcRenderer.invoke('ext:open-file-explorer', path),

    openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
    showDialog: (options) => ipcRenderer.invoke('dialog:show-dialog', options),

    fileExists: (path) => ipcRenderer.invoke('files:fileExists', path),
    getFilesInPath: (path) => ipcRenderer.invoke('files:getFilesInPath', path),
    locateMissingByFingerprint: (fingerprints, path) => ipcRenderer.invoke('files:locateMissingByFingerprint', fingerprints, path),
    getDirectoryHierarchy: (path) => ipcRenderer.invoke('files:getDirectoryHierarchy', path),
    getDirectoryParent: (path) => ipcRenderer.invoke('files:getDirectoryParent', path),
    generateThumbnail: (file, generateIfMissing) => ipcRenderer.invoke('files:generateThumbnail', file, generateIfMissing),
    clearThumbnailCache: () => ipcRenderer.invoke('files:clearThumbnailCache'),
    on: (channel, callback) => {
        // Optional: whitelist allowed channels for security
        const validChannels = ['scan:progress', 'scan:complete', 'getFiles:progress', 'getFiles:complete'];

        if (validChannels.includes(channel)) {
            // Deliberately strip event object to prevent exposure of Electron internals
            const subscription = (event, ...args) => callback(...args);
            ipcRenderer.on(channel, subscription);

            // Return unsubscribe function
            return () => {
                ipcRenderer.removeListener(channel, subscription);
                console.log(`Unsubscribed from ${channel}`);
            };
        }
        console.warn(`Channel ${channel} not allowed`);
        return () => { };
    },
});
