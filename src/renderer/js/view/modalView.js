export const modalView = {

    isAnyModalOpen() {
        const modals = document.querySelectorAll('.modal');
        return Array.from(modals).some(modal => !modal.classList.contains('hidden'));
    }

}
