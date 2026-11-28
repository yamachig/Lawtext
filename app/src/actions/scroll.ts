const blinkOnceClassName = "blink-once";

export const scrollToLawAnchor = (id: string): void => {
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            for (let details = el.parentElement?.closest("details"); details; details = details.parentElement?.closest("details")) {
                if (!details.open) details.open = true;
            }

            const scrollEL = document.getElementsByClassName("law-anchor-scroll-box")[0];
            if (!scrollEL) return;
            const elRect = el.getBoundingClientRect();
            const scrollELRect = scrollEL.getBoundingClientRect();
            scrollEL.scrollTop += elRect.top - scrollELRect.top - 60;

            if (el.nextSibling && el.nextSibling instanceof Element && !el.nextSibling.classList.contains(blinkOnceClassName)) {
                const blinkEl = el.nextSibling;
                blinkEl.classList.add(blinkOnceClassName);
                setTimeout(() => {
                    blinkEl.classList.remove(blinkOnceClassName);
                }, 5000);
            }
            return;
        }
    }
    console.error(`scrollToLawAnchor(id=${id}) could not find id.`);
};
