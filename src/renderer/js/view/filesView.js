const sortByName = document.getElementById('sort-by-name');

export const filesView = {

    updateSortDirectionIndicator(sortOrder) {
        if (sortOrder === 'asc') {
            sortByName.style.backgroundImage = "url('images/sort-up-az.png')"
        } else {
            sortByName.style.backgroundImage = "url('images/sort-down-az.png')"
        }
    },

    onSortClick(handler) {
        sortByName.addEventListener('click', () => handler());
    },
}