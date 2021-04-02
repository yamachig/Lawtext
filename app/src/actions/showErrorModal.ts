import $ from "jquery";
export const ErrorModalID = "LawtextAppPage.ErrorModal";
export const showErrorModal = (title: string, bodyEl: string): void => {
    const modalEl = document.getElementById(ErrorModalID);
    if (!modalEl) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modal = $(modalEl) as JQuery<HTMLElement> & { modal: (method: string) => any };
    modal.find(".modal-title").html(title);
    modal.find(".modal-body").html(bodyEl);
    modal.modal("show");
};
