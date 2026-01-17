export const historyView = {
    prevBtn: null,
    nextBtn: null,

    init() {
        this.prevBtn = document.getElementById('prev-button');
        this.nextBtn = document.getElementById('next-button');
    },

    disablePreviousButton() {
        this.prevBtn.disabled = true;
    },

    enablePreviousButton() {
        this.prevBtn.disabled = false;
    },

    disableNextButton() {
        this.nextBtn.disabled = true;
    },

    enableNextButton() {
        this.nextBtn.disabled = false;
    },

    onPreviousClick(handler) {
        this.prevBtn.addEventListener('click', handler);
    },

    onNextClick(handler) {
        this.nextBtn.addEventListener('click', handler);
    }
};
