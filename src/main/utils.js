const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const MAX_FOLDERS = 1000;

async function getDirectoryHierarchy(directoryPath) {
    let folderCount = 0;

    const buildHierarchy = async (dirPath) => {
        if (folderCount >= MAX_FOLDERS) {
            throw new Error(`Directory hierarchy is too large. Limit is ${MAX_FOLDERS} folders.`);
        }
        folderCount++;
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const children = await Promise.all(
            items
                .filter(item => item.isDirectory())
                .map(async item => {
                    const fullPath = path.join(dirPath, item.name);
                    return await buildHierarchy(fullPath);
                })
        );
        return {
            name: path.basename(dirPath),
            fullPath: dirPath,
            children
        };
    };
    return await buildHierarchy(directoryPath);
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

async function generateThumbnail(filePath, thumbnailPath) {
    const extension = path.extname(filePath).slice(1);
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension.toLowerCase())) {
        await sharp(filePath)
            .resize(400, 225, { fit: 'inside' })
            .toFile(thumbnailPath);
    } else if (['mp4', 'webm'].includes(extension.toLowerCase())) {
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .screenshots({
                    timestamps: ['0'], // First frame
                    filename: path.basename(thumbnailPath),
                    folder: path.dirname(thumbnailPath),
                    size: '400x225'
                })
                .on('end', resolve)
                .on('error', reject);
        });
    } else {
        console.warn(`Cannot generate thumbnail for unsupported file type: ${extension}`);
        //throw new Error(`Unsupported file type: ${extension}`);
    }
}

module.exports = { getDirectoryHierarchy, getDirectoryParent, generateThumbnail };