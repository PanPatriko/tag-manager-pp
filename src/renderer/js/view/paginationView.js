const pagesSelect = document.getElementById('file-pages');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

export const paginationView = {    

    renderPagesSelect(totalPages, currentPage) {
        pagesSelect.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            pagesSelect.appendChild(option);
        }
        pagesSelect.value = currentPage;
    },

    onPrevPageClick(handler) {
        prevPageButton.addEventListener('click', () => handler());
    },

    onNextPageClick(handler) {
        nextPageButton.addEventListener('click', () => handler());
    },

    onPageSelectChange(handler) {
        pagesSelect.addEventListener('change', (e) => handler(e));
    }

}