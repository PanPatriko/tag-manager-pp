const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

const MAX_FOLDERS = 1000;

// Recursive with limit: returns full hierarchy but stops if too large
async function getDirectoryHierarchyRecursive(directoryPath) {
    let folderCount = 0;

    const buildHierarchy = async (dirPath) => {
        if (folderCount >= MAX_FOLDERS) {
            throw new Error(`Directory hierarchy is too large. Limit is ${MAX_FOLDERS} folders.`);
        }
        folderCount++;
        const items = await fs.readdir(dirPath, { withFileTypes: true });
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

//Non-recursive: returns root and only first-level children
async function getDirectoryHierarchy(directoryPath) {
    const items = await fs.readdir(directoryPath, { withFileTypes: true });
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

async function getVideoDimensions(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const stream = metadata.streams.find(s => s.width && s.height);
            if (stream) {
                resolve({ width: stream.width, height: stream.height });
            } else {
                reject(new Error('No video stream found'));
            }
        });
    });
}

async function generateThumbnail(filePath, thumbnailPath) {
    try {
        await fs.access(filePath);
    } catch (err) {
        console.warn(`generateThumbnail: File does not exist: ${filePath}`);
        return;
    }
    const extension = path.extname(filePath).slice(1);
    const maxWidth = 400;
    const maxHeight = 225;
    if (["jpg", "jpeg", "png", "gif"].includes(extension.toLowerCase())) {
        await sharp(filePath)
            .resize(maxWidth, maxHeight, { fit: "inside" })
            .toFile(thumbnailPath);
    } else if (["mp4", "webm"].includes(extension.toLowerCase())) {
        // Get video dimensions
        let size = `${maxWidth}x${maxHeight}`;
        try {
            const { width, height } = await getVideoDimensions(filePath);
            let newWidth = width;
            let newHeight = height;
            const ratio = width / height;
            if (width > maxWidth || height > maxHeight) {
                if (width / maxWidth > height / maxHeight) {
                    newWidth = maxWidth;
                    newHeight = Math.round(maxWidth / ratio);
                } else {
                    newHeight = maxHeight;
                    newWidth = Math.round(maxHeight * ratio);
                }
            }
            size = `${newWidth}x${newHeight}`;
        } catch (e) {
            console.warn('generateThumbnail: Could not get video dimensions, using default size.', e);
        }
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .screenshots({
                    timestamps: ["0"],
                    filename: path.basename(thumbnailPath),
                    folder: path.dirname(thumbnailPath),
                    size
                })
                .on("end", resolve)
                .on("error", reject);
        });
    } else {
        console.warn(`generateThumbnail: Cannot generate thumbnail for unsupported file type: ${extension}`);
        //throw new Error(`Unsupported file type: ${extension}`);
    }
}

function formatDateYYYYMMDD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

module.exports = { getDirectoryHierarchy, getDirectoryParent, generateThumbnail, formatDateYYYYMMDD, getDirectoryHierarchyRecursive };