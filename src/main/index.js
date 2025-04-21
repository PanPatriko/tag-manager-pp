import Swal from 'sweetalert2';

function showPopup(title, text, icon, showCancelButton = false) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: showCancelButton,
        confirmButtonText: window.translations['ok'],
        cancelButtonText: window.translations['cancel'],
        customClass: {
            popup: 'custom-swal-popup'
        }
    });
}

window.showPopup = showPopup;