import React from "react";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useObserved = () => {

    const [observed, setObserved] = React.useState(false);

    const observedRef = React.useRef<HTMLSpanElement>(null);
    const observerRef = React.useRef<IntersectionObserver>(null);

    const unobserve = React.useCallback(() => {
        const target = observedRef.current;
        const observer = observerRef.current;
        if (target && observer) observer.unobserve(target);
    }, []);

    const observe = React.useCallback(() => {
        const target = observedRef.current;
        const observer = observerRef.current;
        if (!target) {
            console.error("useObserved: no ref found");
            return;
        }
        if (observer) observer.observe(target);
    }, []);

    const forceObserved = React.useCallback(() => {
        unobserve();
        setObserved(true);
    }, [unobserve]);

    React.useEffect(() => {
        observerRef.current = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.intersectionRatio > 0) {
                    unobserve();
                    setObserved(true);
                    return;
                }
            }
        });
    }, [unobserve]);

    React.useEffect(() => {
        observe();
        return unobserve;
    }, [observe, unobserve]);

    return {
        observed,
        observedRef,
        forceObserved,
    };
};
