const blinkOnceClassName = "blink-once";

export const scrollToLawAnchor = (id: string): void => {
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            el.scrollIntoView();
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
