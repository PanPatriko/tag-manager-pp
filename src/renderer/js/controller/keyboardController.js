import { filesModel } from "../model/filesModel.js";

import { modalView } from "../view/modalView.js";

import { openFileTagsModal } from "./fileTagsModalController.js";
import { copyTags, pasteTags } from "./contextMenuController.js";
import { selectAllFiles, selectNextFile, selectPreviousFile } from "./filesController.js";

function isTextInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}

export function initKeyboardShortcuts() {
    
    document.addEventListener('keydown', function (e) {
        if (modalView.isAnyModalOpen()) {
            return;
        }

        if (!isTextInputFocused()) {

            const firstSelectedFile = filesModel.getSelectedFiles()[0];
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                selectAllFiles();
            }
            if (e.ctrlKey && e.key === 'c') {
                if (firstSelectedFile) {
                    copyTags(firstSelectedFile.id);
                }
            }
            if (e.ctrlKey && e.key === 'e') {
                if (firstSelectedFile) {
                    openFileTagsModal();
                }
            }
            if (e.ctrlKey && e.key === 'v') {
                pasteTags();
            }
        }
    });

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'preview-arrow') {
            if (event.data.key === 'ArrowLeft') {
                selectPreviousFile();
            } else if (event.data.key === 'ArrowRight') {
                selectNextFile();
            }
        }
    });

    document.addEventListener('keyup', function (e) {
        if (modalView.isAnyModalOpen()) {
            return;
        }

        if (!isTextInputFocused()) {
            if (e.key === 'ArrowRight') {
                selectNextFile();
            }
            if (e.key === 'ArrowLeft') {
                selectPreviousFile();
            }
        }
    });
}
