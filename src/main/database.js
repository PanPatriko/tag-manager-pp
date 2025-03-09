const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'file_tags.db');

const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database");

        if (!dbExists) {
            db.serialize(() => {
                db.run(`CREATE TABLE "tags" (
                        "id"	INTEGER,
                        "name"	TEXT NOT NULL,
                        "parent_id"	INTEGER,
                        "color"	TEXT,
                        "textcolor"	TEXT,
                        FOREIGN KEY("parent_id") REFERENCES "tags"("id"),
                        PRIMARY KEY("id" AUTOINCREMENT)
                    )`);

                db.run(`CREATE TABLE files (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        path TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL
                    )`);

                db.run(`CREATE TABLE file_tags (
                        file_id INTEGER,
                        tag_id INTEGER,
                        PRIMARY KEY (file_id, tag_id),
                        FOREIGN KEY(file_id) REFERENCES files(id),
                        FOREIGN KEY(tag_id) REFERENCES tags(id)
                    )`);

                db.run(`CREATE TABLE locations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL
                )`);

                console.log("Tables created");
            });
        }
    }
});

module.exports = db;