import React from "react";
import * as std from "../../law/std";

// eslint-disable-next-line no-irregular-whitespace
export const HTMLMarginSpan: React.FC<React.HTMLAttributes<HTMLSpanElement>> = props => <span {...props}>　</span>;

export interface HTMLOptions {
    WrapperComponent?: React.ComponentType<React.PropsWithChildren<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        htmlComponentID: string;
    }>>;
    ControlRunComponent?: React.ComponentType<HTMLComponentProps & {el: std.__EL}>;
    renderControlEL?: boolean;
}

export interface HTMLComponentProps {
    htmlOptions: HTMLOptions;
}

export function wrapHTMLComponent<P, TComponentID extends string>(htmlComponentID: TComponentID, Component: React.ComponentType<P & HTMLComponentProps>) {
    const ret = ((props: P & HTMLComponentProps) => {
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
    }) as React.FC<P & HTMLComponentProps> & {componentID: TComponentID};
    ret.componentID = htmlComponentID;
    return ret;
}
