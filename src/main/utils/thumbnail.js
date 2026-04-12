const ffmpeg = require('fluent-ffmpeg');
const fsp = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

const { app } = require('electron');

const THUMBNAIL_DIR = path.join(app.getPath('userData'), 'thumbnails');

async function ensureThumbnailDir() {
    await fsp.mkdir(THUMBNAIL_DIR, { recursive: true });
}

async function clearThumbnailCache() {
    try {
        if (typeof fsp.rm === 'function') {
            await fsp.rm(THUMBNAIL_DIR, { recursive: true, force: true });
        } else {
            // older Node versions
            await fsp.rmdir(THUMBNAIL_DIR, { recursive: true });
        }
        // recreate thumbnail dir
        await ensureThumbnailDir();
        console.log('Thumbnail cache cleared');      
        return {
            success: true,
            message: 'ok'
        };
    } catch (err) {
        console.error('Error clearing thumbnail cache', err);
        return {
            success: false,
            message: err.message || 'Unknown error'
        };
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

async function generateOrGetThumbnail(file, generateIfMissing = true) {
    await ensureThumbnailDir();

    // directory
    if (file.isDirectory) {
        return { thumbnailSrc: 'images/folder-256.png', fullSize: false, missing: false };
    }

    // missing file
    try {
        await fsp.access(file.path);    
    } catch {
        return { thumbnailSrc: 'images/cross.png', fullSize: false, missing: true };
    }

    const filePath = file.path;
    const extension = path.extname(filePath).slice(1).toLowerCase();

    // Supported types
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
    const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv' /* add more if needed */].includes(extension);

    if (!isImage && !isVideo) {
        console.warn(`Thumbnail: unsupported type → ${extension}`);
        return { thumbnailSrc: 'images/file-256.png', fullSize: false, missing: false };
    }

    // Decide output format – jpeg is most compatible; webp is smaller/faster
    const thumbExt = 'webp';           // ← or 'webp' if you want smaller files
    const thumbFilename = `${file.fingerprint}.${thumbExt}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbFilename);

    // 3. Already exists → just return path (fast path!)
    try {
        await fsp.access(thumbnailPath);
        return { thumbnailSrc: thumbnailPath, fullSize: true, missing: false };
    } catch {
        // doesn't exist → we need to generate it
    }

    if (!generateIfMissing) {
        return { thumbnailSrc: 'images/file-256.png', fullSize: false, missing: false };
    }

    // ────────────────────────────────────────────────
    // 4. Generate thumbnail
    try {
        if (isImage) {
            await sharp(filePath)
                .resize(400, 225, { fit: 'inside', withoutEnlargement: true })
                //.jpeg({ quality: 82 })           // ← tune quality (70–85 common)
                .webp({ quality: 80 })        // if using webp
                .toFile(thumbnailPath);
        }
        else if (isVideo) {

            let size = '400x225';

            try {
                const { width, height } = await getVideoDimensions(filePath);
                let newWidth = width;
                let newHeight = height;

                if (width > 400 || height > 225) {
                    const ratio = width / height;
                    if (width / 400 > height / 225) {
                        newWidth = 400;
                        newHeight = Math.round(400 / ratio);
                    } else {
                        newHeight = 225;
                        newWidth = Math.round(225 * ratio);
                    }
                }
                size = `${newWidth}x${newHeight}`;
            } catch (e) {
                console.warn('Could not get video dimensions, using fallback size', e);
            }

            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .screenshots({
                        timestamps: ['0'],          // first frame; can be ['5%'] or '00:00:03'
                        filename: thumbFilename,
                        folder: THUMBNAIL_DIR,      // ← central folder
                        size
                    })
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.warn(`ffmpeg thumbnail error for ${filePath}`, err);
                        reject(err);
                    });
            });
        }

        // Success → return path
        return { thumbnailSrc: thumbnailPath, fullSize: true, missing: false };
    } catch (err) {
        console.error(`Failed to generate thumbnail for ${filePath}`, err);
        return null;
    }
}

module.exports = {
    generateOrGetThumbnail,
    clearThumbnailCache
};
