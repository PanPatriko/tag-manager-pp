const prevBtn = document.getElementById('prev-button');
const nextBtn = document.getElementById('next-button');    

export const historyView = {    

    setPreviousButtonState(disabled) {
        prevBtn.disabled = disabled;
    },

    setNextButtonState(disabled) {
        nextBtn.disabled = disabled;
    },

    onPreviousClick(handler) {
        prevBtn.addEventListener('click', handler);
    },

    onNextClick(handler) {
        nextBtn.addEventListener('click', handler);
    },

}