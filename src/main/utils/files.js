const crypto = require('crypto');
const fs = require('fs')
const fsp = require('fs').promises;
const path = require('path');

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

async function walkDirectory(dirPath, maxDepth = 10) {
    const results = [];
    async function recurse(currentPath, depth = 0) {
        if (depth > maxDepth) return;
        try {
            const entries = await fsp.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== '.t') {  // Skip system dirs
                    await recurse(path.join(currentPath, entry.name), depth + 1);
                } else if (entry.isFile()) {
                    results.push(path.join(currentPath, entry.name));
                }
            }
        } catch (err) {
            console.warn(`Cannot read ${currentPath}:`, err.message);
        }
    }
    await recurse(dirPath);
    return results;
}

async function getFileHash(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

module.exports = { 
    getDirectoryHierarchy, 
    getDirectoryParent,
    walkDirectory,
    getFileHash, 
};