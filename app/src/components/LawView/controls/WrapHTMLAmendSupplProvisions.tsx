import React from "react";
import type { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import type { AmendSupplProvisionsProps } from "lawtext/dist/src/renderer/rules/law.js";
import { createGlobalStyle } from "styled-components";
import type * as std from "lawtext/dist/src/law/std/index.js";

export const HTMLAmendSupplProvisionsCSS = createGlobalStyle/*css*/`
.amend-suppl-provisions > summary {
    cursor: pointer;
    user-select: none;
}

.amend-suppl-provisions > summary:hover {
    color: var(--bs-link-hover-color);
}
`;

export const getAmendSupplProvisionsLabel = (els: std.SupplProvision[], withRange = true): string => {
    const amendLawNums = els.map(el => el.attr.AmendLawNum ?? "").filter(s => s);
    const first = amendLawNums[0];
    const last = amendLawNums[amendLawNums.length - 1];
    const range = (
        !withRange || !first
            ? ""
            : (first === last)
                ? `：${first}`
                : `：${first}～${last}`
    );
    return `改正附則（${els.length}件${range}）`;
};

export const WrapHTMLAmendSupplProvisions: React.FC<WrapperComponentProps> = props => {
    const { childProps: _childProps, ChildComponent } = props;
    const childProps = _childProps as HTMLComponentProps & AmendSupplProvisionsProps;
    const { els } = childProps;

    if (els.length === 0) return null;

    return (
        <details className="amend-suppl-provisions">
            <summary className="suppl-provision-label">
                {getAmendSupplProvisionsLabel(els)}
            </summary>
            <div className="empty"><br/></div>
            <ChildComponent {...childProps} />
        </details>
    );
};

export default WrapHTMLAmendSupplProvisions;
