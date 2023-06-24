import React from "react";
import ReactDOMServer from "react-dom/server";


const ignoreMessagePatterns = [
    /is using incorrect casing\./,
    /React does not recognize/,
    /Invalid DOM property/,
];

const origWarn = global.console.warn;
const filteredWarn = (message: string, ...args: unknown[]) => {
    if (ignoreMessagePatterns.some(p => p.test(message))) {
        return;
    }
    origWarn(message, ...args);
};

const origError = global.console.error;
const filteredError = (message: string, ...args: unknown[]) => {
    if (ignoreMessagePatterns.some(p => p.test(message))) {
        return;
    }
    origError(message, ...args);
};

export const overrrideConsole = () => {
    console.warn = filteredWarn;
    console.error = filteredError;

    // const origError = global.console.error;
    // console.error = (message, ...args) => {
    //     if (ignoreMessagePatterns.some(p => p.test(message))) {
    //         return;
    //     }
    //     origError(message, ...args);
    // };

    // const origLog = global.console.log;
    // console.log = (message, ...args) => {
    //     if (ignoreMessagePatterns.some(p => p.test(message))) {
    //         return;
    //     }
    //     origLog(message, ...args);
    // };
};

export const revertConsole = () => {
    console.warn = origWarn;
    console.error = origError;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderToStaticMarkup = (element: React.ReactElement<any, string | React.JSXElementConstructor<any>>) => {
    try {
        overrrideConsole();
        const ret = ReactDOMServer.renderToStaticMarkup(element);
        return ret;
    } finally {
        revertConsole();
    }
};

export const withKey = (els: (JSX.Element | string)[], baseKey = 0) => {
    const ret: (JSX.Element | string)[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (typeof el === "string") {
            ret.push(el);
        } else {
            ret.push(React.cloneElement(el, { key: baseKey + i }));
        }
    }
    return ret;
};
