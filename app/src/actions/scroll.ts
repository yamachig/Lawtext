const blinkOnceClassName = "blink-once";

export const scrollToLawAnchor = (id: string): void => {
    const scrollEL = document.querySelector("html");
    if (!scrollEL) return;
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            const elRect = el.getBoundingClientRect();
            const scrollELRect = scrollEL.getBoundingClientRect();
            scrollEL.scrollTop = elRect.top - scrollELRect.top - 50;
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
