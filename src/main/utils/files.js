const crypto = require('crypto');
const fs = require('fs')
const fsp = require('fs').promises;
const path = require('path');

const { findMissingFiles, getAllFilesInDirectory } = require('../db/files.js');
const { updateFile } = require('../db/files.js');

const SCAN_CONCURRENCY = 4;
const PROGRESS_UPDATE_EVERY = 25;

function createLimit(concurrency) {
    let activeCount = 0;
    const queue = [];

    const next = () => {
        if (queue.length === 0 || activeCount >= concurrency) return;

        activeCount++;
        const { fn, resolve, reject } = queue.shift();

        Promise.resolve()
            .then(fn)
            .then(resolve)
            .catch(reject)
            .finally(() => {
                activeCount--;
                next();
            });
    };

    return (fn) => {
        return new Promise((resolve, reject) => {
            queue.push({ fn, resolve, reject });
            next();
        });
    };
}

//Non-recursive: returns root and only first-level children
async function getDirectoryHierarchy(directoryPath) {
    const items = await fsp.readdir(directoryPath, { withFileTypes: true });
    const children = items
        .filter(item => item.isDirectory())
        .map(item => ({
            name: item.name,
            fullPath: path.join(directoryPath, item.name),
            children: []
        }));
    return {
        name: path.basename(directoryPath),
        fullPath: directoryPath,
        children
    };
}

async function getDirectoryParent(directoryPath) {
    try {
        const parentDirectory = path.dirname(directoryPath);

        if (parentDirectory === directoryPath) {
            throw new Error('No parent directory exists.');
        }

        return parentDirectory;
    } catch (error) {
        console.error(`Error getting parent directory for ${directoryPath}:`, error);
        throw error;
    }
}

async function locateMissingFiles(event, missingFingerprints, scanPath) {

    if (!missingFingerprints?.length) {
        return { success: false, message: "No missing files to locate" };
    }

    event.sender.send("scan:progress", {
        message: `Scanning ${scanPath}...`,
        progress: 0
    });

    try {

        const missingFiles = await findMissingFiles(missingFingerprints);

        const indexes = buildIndexes(missingFiles);

        const filePaths = await walkDirectory(scanPath);

        const totalFiles = filePaths.length;
        let scanned = 0;
        let found = 0;

        const updates = [];

        const limit = createLimit(Math.min(SCAN_CONCURRENCY, Math.max(1, totalFiles)));

        const tasks = filePaths.map(filePath =>
            limit(async () => {

                const result = await processFile(filePath, indexes);

                scanned++;

                if (result) {
                    found++;
                    updates.push(result);
                }

                const progress = Math.round((scanned / totalFiles) * 100);

                event.sender.send("scan:progress", {
                    progress,
                    scanned,
                    total: totalFiles,
                    found
                });

            })
        );

        await Promise.all(tasks);

        event.sender.send("scan:complete", {
            found,
            totalMissing: missingFingerprints.length,
            updates
        });

        return {
            success: true,
            message: `Located ${found} out of ${missingFingerprints.length} missing files`,
            updates
        };

    } catch (err) {
        console.error("Scan error:", err);

        return {
            success: false,
            message: err.message
        };
    }
}

async function walkDirectory(dirPath, maxDepth = 10) {
    const results = [];
    async function recurse(currentPath, depth = 0) {
        if (depth > maxDepth) return;
        try {
            const entries = await fsp.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                if (entry.isDirectory()) {
                    await recurse(fullPath, depth + 1);
                } else {
                    results.push(fullPath);
                }
            }
        } catch (err) {
            console.warn(`Cannot read ${currentPath}:`, err.message);
        }
    }
    await recurse(dirPath);
    return results;
}

function buildIndexes(missingFiles) {
    const metadataIndex = new Map();
    const sizeSet = new Set();

    for (const file of missingFiles) {
        const key = `${file.size}-${file.last_modified}`;

        if (!metadataIndex.has(key)) {
            metadataIndex.set(key, []);
        }

        metadataIndex.get(key).push(file);
        sizeSet.add(file.size);
    }

    return { metadataIndex, sizeSet };
}

async function processFile(filePath, indexes) {
    const { metadataIndex, sizeSet } = indexes;

    try {
        const stat = await fs.promises.stat(filePath);
        if (!stat.isFile()) return null;

        // Fast reject by size
        if (!sizeSet.has(stat.size)) {
            return null;
        }

        const mtime = Math.floor(stat.mtimeMs);
        const key = `${stat.size}-${mtime}`;

        const candidates = metadataIndex.get(key) || [];

        // Exact metadata match
        if (candidates.length === 1) {
            const file = candidates[0];

            await updateFile({
                id: file.id,
                name: path.basename(filePath),
                path: filePath
            });

            return {
                id: file.id,
                oldPath: file.path,
                newPath: filePath,
                matchedBy: "metadata"
            };
        }

        // Multiple candidates -> need fingerprint
        if (candidates.length > 1) {
            const fingerprint = await getFastFileFingerprint(filePath, stat);
            const match = candidates.find(c => c.fingerprint === fingerprint);

            if (match) {
                await updateFile({
                    id: match.id,
                    name: path.basename(filePath),
                    path: filePath
                });

                return {
                    id: match.id,
                    oldPath: match.path,
                    newPath: filePath,
                    matchedBy: "fingerprint"
                };
            }
        }

        return null;

    } catch (err) {
        console.warn(`Error processing ${filePath}:`, err.message);
        return null;
    }
}

async function getFilesInPath(event, directoryPath) {
    try {

        const dirEntries = await fs.promises.readdir(directoryPath, { withFileTypes: true });

        const filtered = dirEntries.filter(entry =>
            entry.name !== 'desktop.ini' &&
            entry.name !== 'Thumbs.db'
        );

        const total = filtered.length;
        let processed = 0;

        // Load DB files and build indexes once
        const dbFiles = await getAllFilesInDirectory(directoryPath);

        const indexes = { metadataIndex: new Map(), pathIndex: new Map() };

        for (const file of dbFiles) {
            const key = `${file.size}-${Math.floor(file.last_modified)}`;
            if (!indexes.metadataIndex.has(key)) indexes.metadataIndex.set(key, []);
            indexes.metadataIndex.get(key).push(file);
            indexes.pathIndex.set(file.path, file);
        }

        const results = [];
        const limit = createLimit(Math.min(SCAN_CONCURRENCY, Math.max(1, filtered.length)));

        const sendProgress = () => {
            event.sender.send("getFiles:progress", {
                directory: directoryPath,
                processed,
                total,
                progress: total === 0 ? 100 : Math.round((processed / total) * 100),
            });
        };

        sendProgress();

        const tasks = filtered.map(entry =>
            limit(async () => {
                const result = await processEntry(directoryPath, entry, indexes);

                results.push(result);
                processed++;

                if (processed % PROGRESS_UPDATE_EVERY === 0 || processed === total) {
                    sendProgress();
                }
            })
        );

        await Promise.all(tasks);

        event.sender.send("getFiles:complete", {
            directory: directoryPath,
            total
        });

        return results;

    } catch (err) {

        console.error(`Error reading directory ${directoryPath}:`, err);

        return {
            error: 'Unable to read directory',
            message: err.message
        };
    }
}

async function processEntry(directoryPath, entry, indexes) {
    const { metadataIndex, pathIndex } = indexes;

    const fullPath = path.join(directoryPath, entry.name);

    try {

        const stat = await fs.promises.stat(fullPath);

        const fileSize = stat.size;
        const mtimeMs = Math.floor(stat.mtimeMs);
        const birthtimeMs =
            stat.birthtimeMs && !isNaN(stat.birthtimeMs)
                ? Math.floor(stat.birthtimeMs)
                : null;

        const metaKey = `${fileSize}-${mtimeMs}`;
        const candidates = metadataIndex.get(metaKey) || [];

        // STEP 1 — metadata match

        if (candidates.length === 1) {
            const dbFile = candidates[0];

            return {
                name: entry.name,
                path: fullPath,
                isDirectory: entry.isDirectory(),
                id: dbFile.id,
                size: fileSize,
                fingerprint: dbFile.fingerprint,
                created_at: birthtimeMs,
                last_modified: mtimeMs,
                fromCache: true
            };
        }

        // STEP 2 — path lookup
        if (pathIndex.has(fullPath)) {
            const dbFile = pathIndex.get(fullPath);

            return {
                name: entry.name,
                path: fullPath,
                isDirectory: entry.isDirectory(),
                id: dbFile.id,
                size: fileSize,
                fingerprint: dbFile.fingerprint,
                created_at: birthtimeMs,
                last_modified: mtimeMs,
                fromCache: true
            };
        }

        // STEP 3 — new file
        return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            id: null,
            size: fileSize,
            fingerprint: null,
            created_at: birthtimeMs,
            last_modified: mtimeMs,
            fromCache: false
        };

    } catch (err) {

        console.warn(`Cannot process ${fullPath}:`, err.message);

        return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            id: null,
            size: null,
            fingerprint: null,
            created_at: null,
            last_modified: null
        };
    }
}

async function getFastFileFingerprint(filePath, stat = null, algorithm = 'sha256') {
    const fileStat = stat ?? await fsp.stat(filePath);
    const hash = crypto.createHash(algorithm);
    const sampleSize = 64 * 1024;
    const size = fileStat.size ?? 0;
    const mtimeMs = Math.floor(fileStat.mtimeMs ?? 0);
    const fd = await fsp.open(filePath, 'r');

    try {
        hash.update(String(size));
        hash.update(':');
        hash.update(String(mtimeMs));

        if (size === 0) {
            return hash.digest('hex');
        }

        const sampledRanges = [];
        sampledRanges.push({ start: 0, length: Math.min(sampleSize, size) });

        if (size > sampleSize) {
            const middleStart = Math.max(0, Math.floor((size - sampleSize) / 2));
            sampledRanges.push({ start: middleStart, length: Math.min(sampleSize, size - middleStart) });
        }

        if (size > sampleSize * 2) {
            const tailStart = Math.max(0, size - sampleSize);
            sampledRanges.push({ start: tailStart, length: Math.min(sampleSize, size - tailStart) });
        }

        const uniqueRanges = sampledRanges.filter((range, index, ranges) =>
            ranges.findIndex(other => other.start === range.start && other.length === range.length) === index
        );

        for (const { start, length } of uniqueRanges) {
            const buffer = Buffer.alloc(length);
            const { bytesRead } = await fd.read(buffer, 0, length, start);
            hash.update(buffer.subarray(0, bytesRead));
        }

        return hash.digest('hex');
    } finally {
        await fd.close();
    }
}

module.exports = { 
    getDirectoryHierarchy, 
    getDirectoryParent,
    locateMissingFiles,
    getFilesInPath,
    walkDirectory,
    getFastFileFingerprint,
};
