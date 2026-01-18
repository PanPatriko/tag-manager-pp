export const filesView = {
    sortByName: null,
    sortByDate: null,
    loadingBarContainer: null,
    loadingBar: null,
    panel: null,

    init() {
        this.sortByName = document.getElementById('sort-by-name');
        this.sortByDate = document.getElementById('sort-by-date');
        this.loadingBarContainer = document.getElementById('loading-bar-container');
        this.loadingBar = document.getElementById('loading-bar');
        this.panel = document.getElementById('files-panel');
    },

    updateSortByNameDirectionIndicator(sortOrder) {
        if (sortOrder === 'asc') {
            this.sortByName.style.backgroundImage = "url('images/sort-down-az.png')"
        } else {
            this.sortByName.style.backgroundImage = "url('images/sort-up-az.png')"
        }
    },

    updateSortByDateDirectionIndicator(sortOrder) {
        if (sortOrder === 'asc') {
            this.sortByDate.style.backgroundImage = "url('images/sort-down-date.png')"
        } else {
            this.sortByDate.style.backgroundImage = "url('images/sort-up-date.png')"
        }
    },

    addIdToContainer(file) {
        const container = this.findFileContainerByPath(file.path);
        if (!container) return;
        container.dataset.id = file.id;
    },

    removeIdFromContainer(id) {
        const container = this.findFileContainerById(id);
        if (!container) return;
        container.dataset.id = null;
    },

    selectAllFiles() {
        document.querySelectorAll('.file-container').forEach(el => {
            el.setAttribute('data-checked', 'true');
        });
    },

    resetSelection() {
        document.querySelectorAll('.file-container').forEach(file => {
            file.dataset.checked = 'false';
        });
    },

    findAllContainers() {
        return Array.from(document.querySelectorAll('.file-container'));
    },

    findFileContainerById(id) {
        return document.querySelector(`.file-container[data-id="${id}"]`);
    },

    findFileContainerByPath(path) {
        return document.querySelector(`.file-container[data-path="${CSS.escape(path)}"]`);
    },

    setContainerSelected(container, isSelected) {
        if (!container) return;
        container.dataset.checked = isSelected ? 'true' : 'false';
    },

    showLoadingBar() {
        this.loadingBarContainer.classList.remove('hidden');
        this.loadingBar.style.width = '0%';
    },

    hideLoadingBar() {
        this.loadingBarContainer.classList.add('hidden');
    },

    updateLoadingBar(progress) {
        this.loadingBar.style.width = `${progress}%`;
    },

    clearPanel() {
        this.panel.innerHTML = '';
    },

    createFileElement(file, options = {}) {
        const { thumbnailSrc = '', fullSize = false, missing = false, containerSize } = options;

        const containerWrapper = document.createElement('div');
        containerWrapper.className = 'file-container-wrapper';

        const span = document.createElement('span');
        span.className = 'file-container-text';
        span.textContent = file.name;

        const container = document.createElement('div');
        container.style.width = containerSize + 'px';
        container.style.height = containerSize + 'px';
        container.setAttribute('title', file.name);
        container.className = 'file-container';
        container.dataset.path = file.path;
        container.dataset.id = file.id;

        const thumbnail = document.createElement('img');
        thumbnail.className = 'file-thumbnail';
        thumbnail.alt = file.name;
        thumbnail.src = thumbnailSrc;

        // sizing based on computed fullness
        if (fullSize) {
            thumbnail.style.width = '100%';
            thumbnail.style.height = '100%';
        } else {
            thumbnail.style.width = '75%';
            thumbnail.style.height = '75%';
        }

        if (missing) {
            container.style.backgroundColor = 'pink';
        }

        container.appendChild(thumbnail);
        containerWrapper.appendChild(container);
        containerWrapper.appendChild(span);

        this.panel.appendChild(containerWrapper);
    },

    getClosestFileContainer(target) {
        return target.closest('.file-container');
    },

    onSortClick(handler) {
        this.sortByName.addEventListener('click', () => handler());
    },

    onSortDateClick(handler) {
        this.sortByDate.addEventListener('click', () => handler());
    },
    
    onPanelClick(handler) {
        this.panel.addEventListener('click', (e) => handler(e));
    },

    onPanelDblClick(handler) {
        this.panel.addEventListener('dblclick', (e) => handler(e));
    },
}