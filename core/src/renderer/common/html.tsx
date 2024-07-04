import React from "react";
import { EL } from "../../node/el";

// eslint-disable-next-line no-irregular-whitespace
export const HTMLMarginSpan: React.FC<React.HTMLAttributes<HTMLSpanElement>> = props => <span {...props}>　</span>;

export type WrapperComponentProps = {
    htmlComponentID: string;
    childProps: HTMLComponentProps;
    ChildComponent: React.ComponentType<HTMLComponentProps>;
};

export interface HTMLFigData {
    url: string,
    type: string,
}

export type HTMLGetFigData = (
     (src: string) =>
        | HTMLFigData
        | null
);

export interface HTMLOptions {
    WrapComponent?: React.FC<WrapperComponentProps>;
    renderControlEL?: boolean;
    getFigData?: HTMLGetFigData;
    renderPDFAsLink?: boolean;
    annotateLawtextRange?: boolean;
    options?: object;
}

export interface HTMLComponentProps {
    htmlOptions: HTMLOptions;
}

export function wrapHTMLComponent<P, TComponentID extends string>(htmlComponentID: TComponentID, Component: React.ComponentType<P & HTMLComponentProps>) {
    const ret = ((props: P & HTMLComponentProps) => {
        const { htmlOptions } = props;
        if (htmlOptions.WrapComponent) {
            return (
                <htmlOptions.WrapComponent
                    htmlComponentID={htmlComponentID}
                    childProps={props}
                    ChildComponent={Component as React.ComponentType<HTMLComponentProps>}
                />
            );
        } else {
            return <Component {...props} />;
        }
    }) as React.FC<P & HTMLComponentProps> & {componentID: TComponentID};
    ret.componentID = htmlComponentID;
    return ret;
}

export const elProps = (el: EL, htmlOptions: HTMLOptions) => {
    const ret: Record<string, string> = {};
    if (htmlOptions.annotateLawtextRange && el.range) {
        ret["data-lawtext_range"] = JSON.stringify(el.range);
        ret["data-el_id"] = JSON.stringify(el.id);
    }
    return ret;
};
