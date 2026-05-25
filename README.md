# TagManagerPP
**A lightweight, personal file tagging application** designed to help you organize and quickly find your files using custom tags.

## Screenshots
*(TODO Add 3-4 screenshots here)*

## About
TagManagerPP helps you attach meaningful tags to files so you can search and browse your collection efficiently...

Built for learning — This project was created primarily to help me improve my coding skills while building something practical. There are several similar solutions on the market (much more professional than this one, by the way), but they had certain features I didn’t like, such as the lack of a dark/light mode, limits on the number of files that can be tagged, or using sidecar files instead of storing tags in a database. I wondered if building my own app would be difficult. So, using the knowledge I already had — and, I won’t deny it, with a lot of AI help — that’s how TagManagerPP came to be.

## Features

- 🏷️ **Hierarchical Tag System** - Create and organize tags in a tree structure for flexible file categorization
- 📁 **Location Management** - Define and manage multiple file locations for quick access
- 📊 **File Organization** - Pagination and sorting capabilities for large file collections
- 🔍 **Advanced Search** - Search files by multiple tag combinations (OR, AND, NOT operators)
- 📄 **File Preview** - Built-in preview for images and videos
- 🏗️ **SQLite Database** - Persistent storage of file metadata and relationships
- 🌍 **Multilingual Support** - English and Polish language support, it's easy to add more languages if needed
- 🎨 **Dark/Light Themes** - Toggle between day and night modes
- 🚫🌐 **Offline** - Works 100% offline; no internet connection required
- 🖥️ **Cross-platform** - Runs on Windows and Linux

## How to Install
- ⬇️ Download latest release [GitHub Releases Page](https://github.com/PanPatriko/tag-manager-pp/releases).  
- 🛠️ Or build from source, see [Developer Guide](#Developer-Guide)

## User Guide
TODO Screenshots and basic guide

### Basic Workflow

1. **Add Locations** - Define file directories to manage
2. **Create Tags** - Organize your tagging hierarchy
3. **Tag Files** - Right-click on files to assign tags
4. **Search & Filter** - Use tags and search to find files quickly
5. **Preview** - View file details and preview content

## ⚠️ Current Limitations

### File Recognition Method:
This application currently identifies files by content partial hash (fingerprint), not by file path.
What this means:

Advantages:
- Tags stay attached even if you move or rename files (it is not automatic yet, but you can use the 'Find Missing Files' feature)
- Automatically recognizes duplicate files (same content in different locations) and assigns tags to them
- Works well with external drives, backups, and file reorganizations

Limitations:
- If you modify a file (even slightly), the application will treat it as a new file
- Tags from the old version will not be automatically transferred
- You will need to manually copy tags from the old version to the new one (feature already available)

Who this app is best for right now:
- Users who mostly add new files or reorganize their existing files
- Archiving and long-term file management
- Users with relatively stable files (photos, videos, PDFs, completed documents)

Who this app is not for:
- Writers, programmers, designers — anyone who frequently edits text documents, code, images, etc.

An attempt will be made to resolve this issue in the future, but for now, this is how it works.

### View-Only Mode
The app only allows you to view files. You cannot edit, delete, or copy them to other folders. 
You can rename the file directly in the app.

### File Preview
In the preview window, you can zoom in and move elements, but this only works for images and videos.
Previewing other file types is not yet supported.

### Performance
The application is limited by SQLite's inherent constraints — https://sqlite.org/limits.html
The limits are so high that it seems unrealistic to achieve them at home on a local PC.

When it comes to browsing files, the app seems to perform just as well as the system's built-in file explorer. 
It may be a bit slower because it has to calculate the fingerprint needed to generate thumbnails.

Potential issues may arise when a user opens a folder containing a large number of files (several thousand) and tries, for example, to sort them by date. The app hasn't been thoroughly tested in this regard.

## Developer Guide

### Tech Stack

- **Framework**: Electron
- **Frontend**: HTML5, CSS3, JavaScript (plan for the future — React)
- **Backend**: Node.js
- **Database**: SQLite3
- **Build Tools**: Webpack, Babel
- **Additional Libraries**:
  - FFmpeg (thumbnail generation for videos)
  - Sharp (image processing)
  - SweetAlert2 (UI notifications)

### Installation

#### Prerequisites
- Node.js (v14 or higher)
- npm

#### Setup

1. Clone the repository:
```bash
git clone https://github.com/PanPatriko/tag-manager-pp.git
cd tag-manager-pp
```

2. Install dependencies:
```bash
npm install
```

3. Run webpack, use this command if bundle.js does not exist in the webpack directory or if you want to update it:
```bash
npm run webpack
```

4. Start the application:
```bash
npm start
```

#### Building for Distribution

To build the application as a standalone executable:
```bash
npm run build
```

The compiled application will be available in the `dist/` folder.

### Project Structure

```
tag-manager-pp/
├── src/
│   ├── main/                     # Electron main process
│   │   └── db/                   # Database models
│   │       ├── files.js
│   │       ├── filetags.js
│   │       ├── locations.js
│   │       └── tags.js
│   │   └── utils/                # Utility functions
│   │       ├── files.js     
│   │       ├── thumbnail.js
│   │   ├── database.js           # Database initialization
│   │   ├── ipcHandlers.js        # IPC event handlers
│   │   ├── main.js               # Application entry point
│   │   ├── preload.js            # IPC preload script
│   └── renderer/                 # Electron renderer process (UI)
│       ├── css/                  # Stylesheets
│       │   ├── base/             # Base styles
│       │   ├── components/       # Component styles
│       │   ├── features/         # Feature-specific styles
│       │   └── layout/           # Layout styles
│       │   └── main.css          # Main CSS file
│       ├── images/               # Application images and icons
│       ├── js/                   # Frontend JavaScript
│       │   ├── controller/       # MVC controllers
│       │   ├── model/            # MVC models
│       │   ├── view/             # MVC views
│       │   ├── main.js           # Init script for main window
│       │   ├── previewTab.js     # Init script for preview window
│       │   ├── rendererEntry.js  # Entry for webpack build
│       │   ├── showPopup.js      # SweetAlert2 pop-ups
│       │   ├── utils.js          # Utility functions
│       ├── locales/              # i18n translation files
│       ├── index.html            # Main application HTML code
│       ├── preview.html          # Preview tab HTML code
├── db-migrate.js                 # Migration script 1.3.0 -> 2.0.0
├── package.json                  # Dependencies and scripts
├── README.md                     # This file
└── webpack.config.js             # Webpack configuration
```

### Architecture

The application follows an MVC pattern:
- **Models** (`src/renderer/js/model/`) - Data management and business logic
- **Controllers** (`src/renderer/js/controller/`) - Event handling and coordination
- **Views** (`src/renderer/js/view/`) - DOM manipulation and rendering

### Localization

Translations are located in `src/renderer/locales/`:
- `en.json` - English
- `pl.json` - Polish

Add new strings and use `i18nModel.t('key')` to retrieve translations.

## Known Issues

There's definitely something there, but I don't know it yet ...

## Future Plans

- [ ] Background file scanner that automatically detects modified or moved files to ensure they retain their tags
- [ ] Finding duplicates
- [ ] File preview for more file types (pdf, txt)
- [ ] Customizable color themes (beyond day/night modes)
- [ ] Drag-And-Drop tag organization
- [ ] Tags context menu with quick search integration
- [ ] React component migration
- [ ] Unit tests
- [ ] Intergration with local LLM, automatic file recognition and tagging

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License — See [LICENSE](LICENSE) file for details

## Author

Patryk Panasiuk ([@PanPatriko](https://github.com/PanPatriko))

---

**Last Updated**: May 2026 | **Version**: 2.0.1