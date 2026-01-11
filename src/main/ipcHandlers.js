const { ipcMain, shell, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const { generateThumbnail, getDirectoryHierarchy, getDirectoryParent, formatDateYYYYMMDD } = require('./utils.js');
const { getTags, getTagById, createTag, updateTag, deleteTag } = require('./db/tags.js');
const { getFiles, getFileById, getFileByPath, searchFiles, createFile, updateFile, deleteFile } = require('./db/files.js');
const { getFileTags, addFileTag, deleteFileTag } = require('./db/filetags.js');
const { getLocations, createLocation, updateLocation, deleteLocation } = require('./db/locations.js');

// ipcMain.handle for tags.js
ipcMain.handle('dbtags:get-tags', async (event,) => {
  return await getTags();
});

ipcMain.handle('dbtags:get-tag-by-id', async (event, id) => {
  return await getTagById(id);
});

ipcMain.handle('dbtags:create-tag', async (event, tagData) => {
  return await createTag(tagData);
});

ipcMain.handle('dbtags:update-tag', async (event, id, tagData) => {
  return await updateTag(id, tagData);
});

ipcMain.handle('dbtags:delete-tag', async (event, id) => {
  return await deleteTag(id);
});

// ipcMain.handle for files.js
ipcMain.handle('dbfiles:get-files', async (event) => {
  return await getFiles();
});

ipcMain.handle('dbfiles:get-file-by-id', async (event, id) => {
  return await getFileById(id);
});

ipcMain.handle('dbfiles:get-file-by-path', async (event, path) => {
  return await getFileByPath(path);
});

ipcMain.handle('dbfiles:create-file', async (event, fileData) => {
  return await createFile(fileData);
});

ipcMain.handle('dbfiles:search-files', async (event, andTags, orTags, notTags) => {
  return await searchFiles(andTags, orTags, notTags);
});

ipcMain.handle('dbfiles:delete-file', async (event, fileId) => {
  return await deleteFile(fileId);
});

ipcMain.handle('dbfiles:update-file', async (event, fileId, newFileName, oldFilePath) => {
  const newFilePath = path.join(path.dirname(oldFilePath), newFileName);
  try {
    await fs.promises.rename(oldFilePath, newFilePath);
    await updateFile({ name: newFileName, path: newFilePath, id: fileId })
    return { success: true, newFilePath };
  } catch (error) {
    console.error('Error updating file name:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dbfiles:update-file-not-db', async (event, newFileName, oldFilePath) => {
  const newFilePath = path.join(path.dirname(oldFilePath), newFileName);
  try {
    await fs.promises.rename(oldFilePath, newFilePath);
    return { success: true, newFilePath };
  } catch (error) {
    console.error('Error updating file name:', error);
    return { success: false, error: error.message };
  }
});

// ipcMain.handle for filetags.js
ipcMain.handle('dbfiletags:get-file-tags', async (event, fileId) => {
  return await getFileTags(fileId);
});

ipcMain.handle('dbfiletags:add-file-tag', async (event, fileId, tagId) => {
  return await addFileTag(fileId, tagId);
});

ipcMain.handle('dbfiletags:delete-file-tag', async (event, fileId, tagId) => {
  return await deleteFileTag(fileId, tagId);
});

// ipcMain.handle for locations.js
ipcMain.handle('dblocations:get-locations', async (event,) => {
  return await getLocations();
});

ipcMain.handle('dblocations:add-location', async (event, locationData) => {
  return await createLocation(locationData);
});

ipcMain.handle('dblocations:update-location', async (event, locationData) => {
  return await updateLocation(locationData);
});

ipcMain.handle('dblocations:delete-location', async (event, locationId) => {
  return await deleteLocation(locationId);
});

// ipcMain.handle for path and shell operations
ipcMain.handle('path-join', (event, ...args) => {
  return path.join(...args);
});

ipcMain.handle('path-dirname', (event, p) => {
  return path.dirname(p);
});

ipcMain.handle('path-basename', (event, p, ext) => {
  return path.basename(p, ext);
});

ipcMain.handle('path-extname', (event, p) => {
  return path.extname(p);
});

ipcMain.handle('ext:open-ext', (event, path) => {
  return shell.openExternal(path);
});

ipcMain.handle('ext:open-file-explorer', async (event, filePath) => {
  const resolvedPath = path.resolve(filePath);
  try {
    shell.showItemInFolder(resolvedPath);
    return { success: true };
  } catch (error) {
    console.error(`Error opening file explorer: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dialog:openFolder', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('dialog:show-dialog', async (event, options) => {
  return await dialog.showMessageBox(options);
});

ipcMain.handle('files:getFilesInPath', async (event, directoryPath) => {
  try {
    const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    return files
      .filter(file => !(file.isDirectory() && file.name === '.t') && file.name !== 'desktop.ini' && file.name !== 'Thumbs.db')
      .map(file => {
        const filePath = path.join(directoryPath, file.name);
        return {
          name: file.name,
          path: filePath,
          isDirectory: file.isDirectory(),
        };
      });
  } catch (error) {
    console.error(`Error reading directory ${directoryPath}:`, error);
    return { error: 'Unable to read directory' };
  }
}); 

ipcMain.handle('files:getFileCreationDate', async (event, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return formatDateYYYYMMDD(stat.birthtime);
  } catch (error) {
    console.error(`Error getting file creation date for ${filePath}:`, error);
    return null;
  }
}); 

ipcMain.handle('files:getDirectoryHierarchy', async (event, directoryPath) => {
  try {
    return getDirectoryHierarchy(directoryPath);
  } catch (error) {
    console.error(error);
    return null;
  }
});

ipcMain.handle('files:getDirectoryParent', async (event, directoryPath) => {
  try {
    return getDirectoryParent(directoryPath);
  } catch (error) {
    console.error(error);
    return null;
  }
});

ipcMain.handle('files:fileExists', async (event, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('files:create-directory', async (event, dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    // Set dir as hidden
    exec(`attrib +h "${dirPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error setting hidden attribute: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
});

ipcMain.handle('files:generateThumbnail', async (event, filePath, thumbnailPath) => {
  try {
    return await generateThumbnail(filePath, thumbnailPath);
  } catch (error) {
    console.error(error);
    return null;
  }
});