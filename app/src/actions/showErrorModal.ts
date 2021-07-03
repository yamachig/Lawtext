import { Modal } from "bootstrap";

export const ErrorModalID = "LawtextAppPage.ErrorModal";
export const showErrorModal = (title: string, bodyEl: string): void => {
    const modalEl = document.getElementById(ErrorModalID);
    const modalTitleEl = modalEl?.querySelector(".modal-title");
    const modalBodyEl = modalEl?.querySelector(".modal-body");
    if (!modalEl || !modalTitleEl || !modalBodyEl) return;
    const modal = new Modal(modalEl);
    modalTitleEl.innerHTML = title;
    modalBodyEl.innerHTML = bodyEl;
    modal.show();
};
