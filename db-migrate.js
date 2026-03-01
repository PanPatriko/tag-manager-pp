const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
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
function getFileHash(filepath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filepath);

        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

async function fileExistsAndGetInfo(filepath) {
    try {
        const stats = await fsp.stat(filepath);
        if (!stats.isFile()) return null;

        const size = stats.size;
        const lastModified = Math.floor(stats.mtimeMs);
        const createdAt = Math.floor(stats.birthtime);

        let hash = null;
        // Only compute hash if file is not extremely large (you can adjust or remove limit)
        if (size < 500 * 1024 * 1024) { // e.g. < 500 MB
            hash = await getFileHash(filepath);
        } else {
            console.warn(`Skipping hash for large file (>500MB): ${filepath}`);
            hash = 'skipped-large-file'; // or leave null, your choice
        }

        return { size, createdAt, lastModified, hash };
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
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
            { name: 'hash', type: 'TEXT' },
            { name: 'size', type: 'INTEGER' },
            { name: 'last_modified', type: 'INTEGER' },
            { name: 'created_at', type: 'INTEGER' }
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
               SET hash = ?, size = ?, last_modified = ?, created_at = ?
               WHERE id = ?`,
                            [info.hash, info.size, info.lastModified, info.createdAt , row.id],
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

        // Example with sqlite3 module
        db.serialize(() => {
            db.run(`
                CREATE INDEX IF NOT EXISTS idx_files_size_mtime 
                ON files(size, last_modified)
            `);

            db.run(`
                CREATE INDEX IF NOT EXISTS idx_files_hash 
                ON files(hash)
            `);

            db.run(`
                CREATE INDEX IF NOT EXISTS idx_files_path 
                ON files(path)
            `);
        });

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