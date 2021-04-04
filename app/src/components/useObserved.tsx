import React from "react";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useObserved = () => {
    const [observed, setObserved] = React.useState(false);
    const observedRef = React.useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        const target = observedRef.current;
        if (!target) {
            console.error("FigRunComponent: no ref found");
            return;
        }
        const unobserve = () => {
            observer.unobserve(target);
        };
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.intersectionRatio > 0) {
                    unobserve();
                    setObserved(true);
                    return;
                }
            }
        });
        observer.observe(target);
        return unobserve;
    }, []);
    return {
        observed,
        observedRef,
    };
};
