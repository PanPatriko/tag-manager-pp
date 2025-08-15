import Swal from 'sweetalert2';
import { i18nModel } from './model/i18nModel';


function showPopup(title, text, icon, showCancelButton = false) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: showCancelButton,
        confirmButtonText: i18nModel.t('ok'),
        cancelButtonText: i18nModel.t('cancel'),
        customClass: {
            popup: 'custom-swal-popup'
        }
    });
}

window.showPopup = showPopup;