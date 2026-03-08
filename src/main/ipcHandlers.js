const { ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const { getDirectoryHierarchy, getDirectoryParent, walkDirectory, getFileHash } = require('./utils/files.js');
const { generateOrGetThumbnail } = require('./utils/thumbnail.js');
const { getTags, getTagById, createTag, updateTag, deleteTag } = require('./db/tags.js');
const { getFiles, getFileById, getFileByPath, getFileByHash, findCandidates, findMissingCandidates, searchFiles, createFile, updateFile, deleteFile } = require('./db/files.js');
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
    if (fileId != null) {
      await updateFile({ name: newFileName, path: newFilePath, id: fileId })
    }
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
    const dirFiles = await fs.promises.readdir(directoryPath, { withFileTypes: true });

    const dirFilesWithData = await Promise.all(
      dirFiles
        .filter(file => {
          // Skip system/junk files
          if (file.name === 'desktop.ini' || file.name === 'Thumbs.db') return false;
          return true;
        })
        .map(async (entry) => {
          const fullPath = path.join(directoryPath, entry.name);
          try {
            // Step 1: Very cheap – get only metadata (no content read)
            const stat = await fs.promises.stat(fullPath);

            const fileSize = stat.size;
            const mtimeMs = Math.floor(stat.mtimeMs);
            const birthtimeMs = stat.birthtimeMs && !isNaN(stat.birthtimeMs)
              ? Math.floor(stat.birthtimeMs)
              : null;

            // Step 1: Fast DB query using size + mtime (needs good index)
            const candidates = await findCandidates(fileSize, mtimeMs);

            if (candidates.length === 1) {
              // High-confidence match (same size + same modification time)
              const dbFile = candidates[0];
              //console.log(`Step 1 Quick match for ${fullPath} → DB file ID ${dbFile.id}`);
              return {
                name: entry.name,
                path: fullPath,
                isDirectory: entry.isDirectory(),
                id: dbFile.id,
                size: fileSize,
                hash: dbFile.hash,  // already known
                created_at: birthtimeMs,
                last_modified: mtimeMs,
                fromCache: true,
              };
            }

            // Step 2: No unique match or multiple → fallback to full path query (still no hashing)
            const dbFile = await getFileByPath(fullPath);

            if (dbFile) {
              //console.log(`Step 2 Find file by path ${fullPath} → DB file ID ${dbFile.id}`);
              return {
                name: entry.name,
                path: fullPath,
                isDirectory: entry.isDirectory(),
                id: dbFile.id,
                size: fileSize,
                hash: dbFile.hash, // already known
                created_at: birthtimeMs,
                last_modified: mtimeMs,
                fromCache: true,
              };
            }

            // Step 3: Completely new file
            //console.log(`Step 3 FIle not found in DB → treating as new file: ${fullPath}`);
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: entry.isDirectory(),
              id: null,
              size: fileSize,
              hash: null, // no hash, and we don't want to compute it here (too slow)
              created_at: birthtimeMs,
              last_modified: mtimeMs,
              fromCache: false,
            };

          } catch (err) {
            console.warn(`Cannot process ${fullPath}:`, err.message);
            return {
              name: entry.name,
              path: fullPath,
              isDirectory: entry.isDirectory(),
              id: null,
              size: null,
              hash: null,
              created_at: null,
              last_modified: null,
            };
          };       
        })
    );

    return dirFilesWithData;

  } catch (err) {
    console.error(`Error reading directory ${directoryPath}:`, err);
    return { error: 'Unable to read directory', message: err.message };
  }
});

ipcMain.handle('files:locateMissingByHash', async (event, missingHashes, scanPath) => {
  if (!missingHashes || missingHashes.length === 0) {
    return { success: false, message: 'No missing files to locate' };
  }

  event.sender.send('scan:progress', { message: `Scanning ${scanPath}...`, progress: 0 });

  try {
    // Step 2: Get all file paths in directory
    const filePaths = await walkDirectory(scanPath);
    const totalFiles = filePaths.length;
    let scanned = 0;
    let found = 0;
    const updates = [];

    // Step 3: Process in batches (parallel for speed, but limit concurrency)
    const BATCH_SIZE = 20;  // Adjust based on CPU
    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (filePath) => {
          try {
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) return null;

            // Quick filter: Check if size + mtime matches any missing (from DB query)
            const candidates = await findMissingCandidates(stat.size, Math.floor(stat.mtimeMs), missingHashes);

            if (candidates.length === 1) {
              // High-confidence match → update path without hashing
              const { id } = candidates[0];
              await updateFile({name: path.basename(filePath), path: filePath, id })
              return { id, oldPath: candidates[0].path, newPath: filePath, matchedBy: 'metadata' };
            }

            // Fallback: Compute hash
            const hash = await getFileHash(filePath);
            if (missingHashes.includes(hash)) {
              // Get the file ID by hash
              const dbFile = await getFileByHash(hash);
              if (dbFile) {
                await updateFile({ name: path.basename(filePath), path: filePath, id: dbFile.id })
                return { id: dbFile.id, oldPath: null, newPath: filePath, matchedBy: 'hash' };
              }
            }
            return null;
          } catch (err) {
            console.warn(`Error processing ${filePath}:`, err.message);
            return null;
          }
        })
      );

      // Collect successes
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          found++;
          updates.push(result.value);
        }
      });

      scanned += batch.length;
      const progress = Math.round((scanned / totalFiles) * 100);
      event.sender.send('scan:progress', { progress, scanned, total: totalFiles, found });

      // Small delay between batches to avoid overwhelming I/O
      if (i + BATCH_SIZE < filePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    event.sender.send('scan:complete', { found, totalMissing: missingHashes.length, updates });

    return {
      success: true,
      message: `Located ${found} out of ${missingHashes.length} missing files`,
      updates,
    };

  } catch (err) {
    console.error('Scan error:', err);
    return { success: false, message: err.message };
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
  try {
    await fs.promises.access(filePath);  // defaults to F_OK
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('files:generateThumbnail', async (event, file) => {
  try {
    return await generateOrGetThumbnail(file);
  } catch (error) {
    console.error(error);
    return null;
  }
});
