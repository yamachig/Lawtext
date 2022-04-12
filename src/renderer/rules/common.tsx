import React from "react";
import * as std from "../../law/std";
import { EL } from "../../node/el";

export const MARGIN = "　";

export interface HTMLComponentProps {
    htmlOptions: {
        WrapperComponent?: React.ComponentType<React.PropsWithChildren<{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            htmlComponentID: string;
        }>>;
        ControlRunComponent?: React.ComponentType<HTMLComponentProps & {el: std.__EL}>;
        renderControlEL?: boolean;
    }
}

export interface ELComponentProps { el: EL }

export function wrapHTMLComponent<P>(htmlComponentID: string, Component: React.ComponentType<P & HTMLComponentProps>) {
    return ((props: P & HTMLComponentProps) => {
        const { htmlOptions } = props;
        if (htmlOptions.WrapperComponent) {
            return (
                <htmlOptions.WrapperComponent {...{ htmlComponentID }}>
                    <Component {...props} />
                </htmlOptions.WrapperComponent>
            );
        } else {
            return <Component {...props} />;
        }
    }) as React.FC<P & HTMLComponentProps>;
}

export const containerInfoOf = (el: EL | string): {tag: string, id: string | number} => {
    if (typeof el === "string") {
        return { tag: "", id: "" };
    } else {
        return { tag: el.tag, id: el.id };
    }
};
