import Swal from 'sweetalert2';

function showPopup(text, icon, showCancelButton = false) {
    return Swal.fire({
        text: text,
        icon: icon,
        showCancelButton: showCancelButton,
        confirmButtonText: '✓',
        cancelButtonText: '✗',
        customClass: {
            confirmButton: 'swal2-transparent-btn swal2-confirm-check',
            cancelButton: 'swal2-transparent-btn swal2-cancel-cross'
        }
    });
}

function showPopupTextFormat(text, icon, showCancelButton = false) {
    return Swal.fire({
        html: '<pre>' + text + '</pre>',
        icon: icon,
        showCancelButton: showCancelButton,
        confirmButtonText: '✓',
        cancelButtonText: '✗',
        customClass: {
            confirmButton: 'swal2-transparent-btn swal2-confirm-check',
            cancelButton: 'swal2-transparent-btn swal2-cancel-cross'
        }
    });
}

window.showPopup = showPopup;
window.showPopupTextFormat = showPopupTextFormat;