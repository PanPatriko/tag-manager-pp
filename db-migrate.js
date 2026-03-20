const fsp = require('fs').promises;
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

// ────────────────────────────────────────────────
//  CONFIGURATION
// ────────────────────────────────────────────────
const DB_PATH = 'C:\\Users\\pc\\AppData\\Roaming\\tag-manager-pp\\file_tags.db';           // ← change to your database path
const BATCH_SIZE = 50;                    // process files in batches to avoid memory issues

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
async function getFastFileFingerprint(filepath, stats = null) {
    const fileStats = stats ?? await fsp.stat(filepath);
    const hash = crypto.createHash('sha256');
    const sampleSize = 64 * 1024;
    const size = fileStats.size ?? 0;
    const mtimeMs = Math.floor(fileStats.mtimeMs ?? 0);
    const fd = await fsp.open(filepath, 'r');

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

function runAsync(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, err => err ? reject(err) : resolve());
    });
}

function allAsync(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
}

async function fileExistsAndGetInfo(filepath) {
    try {
        const stats = await fsp.stat(filepath);
        if (!stats.isFile()) return null;

        const size = stats.size;
        const lastModified = Math.floor(stats.mtimeMs);
        const createdAt = Math.floor(stats.birthtimeMs);
        const isDirectory = stats.isDirectory();
        const fingerprint = await getFastFileFingerprint(filepath, stats);

        return { size, createdAt, lastModified, fingerprint, isDirectory };
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
}

async function rebuildFilesTableWithoutHash(db) {
    await runAsync(db, 'PRAGMA foreign_keys = OFF');
    await runAsync(db, 'BEGIN TRANSACTION');

    try {
        await runAsync(db, `
            CREATE TABLE files_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint TEXT,
                path TEXT,
                name TEXT NOT NULL,
                size INTEGER,
                last_modified INTEGER,
                created_at INTEGER,
                is_directory INTEGER
            )
        `);

        await runAsync(db, `
            INSERT INTO files_new (id, fingerprint, path, name, size, last_modified, created_at, is_directory)
            SELECT id, fingerprint, path, name, size, last_modified, created_at, is_directory
            FROM files
        `);

        await runAsync(db, 'DROP TABLE files');
        await runAsync(db, 'ALTER TABLE files_new RENAME TO files');
        await runAsync(db, 'COMMIT');
    } catch (err) {
        await runAsync(db, 'ROLLBACK');
        throw err;
    } finally {
        await runAsync(db, 'PRAGMA foreign_keys = ON');
    }
}

// ────────────────────────────────────────────────
//  Main logic
// ────────────────────────────────────────────────
(async () => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Cannot open database:', err.message);
            process.exit(1);
        }
        console.log('Connected to SQLite database.');
    });

    db.on('error', err => console.error('Database error:', err.message));

    try {
        // 1. Add missing columns (idempotent)
        console.log('Adding missing columns if needed...');

        const columnsToAdd = [
            { name: 'fingerprint', type: 'TEXT' },
            { name: 'size', type: 'INTEGER' },
            { name: 'last_modified', type: 'INTEGER' },
            { name: 'created_at', type: 'INTEGER' },
            { name: 'is_directory', type: 'INTEGER' }
        ];

        for (const col of columnsToAdd) {
            try {
                await new Promise((resolve, reject) => {
                    db.run(
                        `ALTER TABLE files ADD COLUMN ${col.name} ${col.type}`,
                        err => err ? reject(err) : resolve()
                    );
                });
                console.log(`→ Added column: ${col.name}`);
            } catch (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`→ Column already exists: ${col.name}`);
                } else {
                    throw err;
                }
            }
        }

        const fileColumns = await allAsync(db, 'PRAGMA table_info(files)');
        const hasHash = fileColumns.some(column => column.name === 'hash');

        // 2. Get all current records
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT id, path FROM files', [], (err, rows) => {
                err ? reject(err) : resolve(rows);
            });
        });

        console.log(`Found ${rows.length} files in database. Starting processing...`);

        let processed = 0;
        let updated = 0;
        let deleted = 0;

        // Process in batches
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);

            for (const row of batch) {
                processed++;

                const info = await fileExistsAndGetInfo(row.path);

                if (!info) {
                    // File does not exist anymore → delete record
                    await new Promise(resolve => {
                        db.run('DELETE FROM files WHERE id = ?', row.id, function (err) {
                            if (err) console.error(`Delete failed for id ${row.id}:`, err);
                            else deleted++;
                            resolve();
                        });
                    });
                    console.log(`Deleted (missing): ${row.path}`);
                } else {
                    // File exists → update hash, size, last_modified
                    await new Promise(resolve => {
                        db.run(
                            `UPDATE files
               SET fingerprint = ?, size = ?, last_modified = ?, created_at = ?, is_directory = ?
               WHERE id = ?`,
                            [info.fingerprint, info.size, info.lastModified, info.createdAt, info.isDirectory, row.id],
                            function (err) {
                                if (err) console.error(`Update failed for ${row.path}:`, err);
                                else updated++;
                                resolve();
                            }
                        );
                    });

                    process.stdout.write(`Updated ${updated} / ${processed}   \r`);
                }
            }

            // Small delay between batches to reduce I/O pressure
            if (i + BATCH_SIZE < rows.length) {
                await new Promise(r => setTimeout(r, 300));
            }
        }

        if (hasHash) {
            console.log('Removing legacy hash column...');
            await rebuildFilesTableWithoutHash(db);
        }

        await runAsync(db, 'DROP INDEX IF EXISTS idx_files_hash');
        await runAsync(
            db,
            'CREATE INDEX IF NOT EXISTS idx_files_size_mtime ON files(size, last_modified)'
        );
        await runAsync(
            db,
            'CREATE INDEX IF NOT EXISTS idx_files_path ON files(path)'
        );
        await runAsync(
            db,
            'CREATE UNIQUE INDEX IF NOT EXISTS idx_files_fingerprint_unique ON files(fingerprint) WHERE fingerprint IS NOT NULL'
        );

        console.log('\nProcessing finished.');
        console.log(`Total records:    ${rows.length}`);
        console.log(`Updated records:  ${updated}`);
        console.log(`Deleted records:  ${deleted}`);

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        db.close((err) => {
            if (err) console.error('Error closing database:', err);
            else console.log('Database connection closed.');
        });
    }
})();
