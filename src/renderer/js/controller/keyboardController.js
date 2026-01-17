import { filesModel } from "../model/filesModel.js";

import { modalView } from "../view/modalView.js";

import { fileTagsModalController } from "./fileTagsModalController.js";
import { contextMenuController } from "./contextMenuController.js";
import { filesController } from "./filesController.js";

export const keyboardController = {

    init() {
        
        document.addEventListener('keydown', function (e) {
            if (modalView.isAnyModalOpen()) {
                return;
            }

            if (!isTextInputFocused()) {

                const firstSelectedFile = filesModel.getSelectedFiles()[0];
                if (e.ctrlKey && e.key === 'a') {
                    e.preventDefault();
                    filesController.selectAllFiles();
                }
                if (e.ctrlKey && e.key === 'c') {
                    if (firstSelectedFile) {
                        contextMenuController.copyTags(firstSelectedFile.id);
                    }
                }
                if (e.ctrlKey && e.key === 'e') {
                    if (firstSelectedFile) {
                        fileTagsModalController.openFileTagsModal();
                    }
                }
                if (e.ctrlKey && e.key === 'v') {
                    contextMenuController.pasteTags();
                }
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'preview-arrow') {
                if (event.data.key === 'ArrowLeft') {
                    filesController.selectPreviousFile();
                } else if (event.data.key === 'ArrowRight') {
                    filesController.selectNextFile();
                }
            }
        });

        document.addEventListener('keyup', function (e) {
            if (modalView.isAnyModalOpen()) {
                return;
            }

            if (!isTextInputFocused()) {
                if (e.key === 'ArrowRight') {
                    filesController.selectNextFile();
                }
                if (e.key === 'ArrowLeft') {
                    filesController.selectPreviousFile();
                }
            }
        });
    }
};

function isTextInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}
