import $ from "jquery";

export const scrollToLawAnchor = (id: string): void => {
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            // const rect = el.getBoundingClientRect();
            // const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            // const newScrollTop = scrollTop + rect.top;
            // document.body.scrollTop = newScrollTop;
            // document.documentElement.scrollTop = newScrollTop;
            const offset = $(el).offset();
            if (offset) $("html,body").animate({ scrollTop: offset.top }, "normal");
        }
    }
};
