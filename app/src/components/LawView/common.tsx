import type { LawData } from "../../lawdata/common";

export const em = (input: number) => {
    const emSize = parseFloat(getComputedStyle(document.body).getPropertyValue("font-size"));
    return (emSize * input);
};

export interface LawViewOptions {
    onError: (error: Error) => void;
    lawData: LawData,
    addAfterMountTask: (func: () => unknown) => void,
    firstPart: string,
}
