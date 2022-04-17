import React from "react";

export const DOCXMargin = "　";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DOCXOptions {
}
export interface DOCXComponentProps {
    // eslint-disable-next-line @typescript-eslint/ban-types
    docxOptions: DOCXOptions;
}

export function wrapDOCXComponent<P, TComponentID extends string>(docxComponentID: TComponentID, Component: React.ComponentType<P & DOCXComponentProps>) {
    void docxComponentID;
    const ret = ((props: P & DOCXComponentProps) => {
        return <Component {...props} />;
    }) as React.FC<P & DOCXComponentProps> & {componentID: TComponentID};
    ret.componentID = docxComponentID;
    return ret;
}

export type ComponentWithTag<TTag extends string> = {
    <P>(props: React.PropsWithChildren<P>): React.DOMElement<P & {
        children?: React.ReactNode;
    }, Element>;
    displayName: `ComponentWithTag<${TTag}>`;
}

export function makeComponentWithTag <TTag extends string>(tag: TTag): ComponentWithTag<TTag> {
    const func = function ComponentWithTag<P>(props: React.PropsWithChildren<P>) {
        return React.createElement(tag, props);
    };
    func.displayName = `ComponentWithTag<${tag}>` as const;
    return func;
}

