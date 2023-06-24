import { Container } from "../../node/container";
import { ErrorMessage } from "../../parser/cst/error";
import { assertNever } from "../../util";
import { PathFragment } from "./common";


export interface LocateSuccess {
    ok: true,
    value: {
        container: Container,
        fragments: {container: Container, pathFragment: PathFragment}[],
    },
}

export interface LocateFail {
    ok: false,
    errors: ErrorMessage[],
    partialValue: {
        container: Container,
        fragments: {container: Container, pathFragment: PathFragment}[],
    } | null,
}

export type LocateResult = LocateSuccess | LocateFail;

export const locate = (
    contextContainer: Container,
    path: PathFragment[],
    processedFragments: {container: Container, pathFragment: PathFragment}[],
): LocateResult => {
    if (path.length === 0) return {
        ok: true,
        value: {
            container: contextContainer,
            fragments: processedFragments,
        },
    };
    const fragment = path[0];

    if (fragment.type === "LAW") {

        return {
            ok: false,
            errors: [
                new ErrorMessage(
                    "Unexpected \"LAW\" type fragment in the path",
                    [processedFragments.length, processedFragments.length + path.length],
                ),
            ],
            partialValue: processedFragments.length === 0 ? null : {
                container: processedFragments[processedFragments.length - 1].container,
                fragments: processedFragments,
            },
        };

    } else if (fragment.type === "TOPLEVEL" || fragment.type === "ARTICLES") {

        if (contextContainer.type === "ROOT" && fragment.type === "ARTICLES") {
            const mainProvisionContainer = contextContainer.subChildren.find(c => c.el.tag === "MainProvision");
            if (mainProvisionContainer) return locate(
                mainProvisionContainer,
                path,
                processedFragments,
            );
        }

        if (fragment.tag === "SupplProvision" && fragment.num === null && fragment.attr.length === 0) {
            const cs = contextContainer.children.filter(c => (
                (c.el.tag === fragment.tag) &&
                !("AmendLawNum" in c.el.attr)
            ));
            const c = (
                (fragment.nth)
                    ? cs[Number(fragment.nth) - 1]
                    : cs[0]
            );
            if (c) return locate(c, path.slice(1), [...processedFragments, { container: c, pathFragment: fragment }]);
        }

        const cs = contextContainer.children.filter(c => (
            (c.el.tag === fragment.tag) &&
                (
                    (fragment.num === null) ||
                    ("Num" in c.el.attr && c.el.attr.Num === fragment.num)
                ) &&
                fragment.attr.every(({ key, value }) => (key in c.el.attr && c.el.attr[key] === value))
        ));
        const c = (
            (fragment.nth)
                ? cs[Number(fragment.nth) - 1]
                : cs[0]
        );
        if (c) return locate(c, path.slice(1), [...processedFragments, { container: c, pathFragment: fragment }]);

    } else if (fragment.type === "SENTENCES") {

        if (contextContainer.type === "ROOT") {
            const mainProvisionContainer = contextContainer.subChildren.find(c => c.el.tag === "MainProvision");
            if (mainProvisionContainer) return locate(
                mainProvisionContainer,
                path,
                processedFragments,
            );
        }

        if (
            (fragment.tag !== "Paragraph") &&
            (contextContainer.subChildren.length === 1) &&
            (contextContainer.subChildren[0].el.tag === "Paragraph") &&
            (
                !("Num" in contextContainer.subChildren[0].el.attr) ||
                contextContainer.subChildren[0].el.attr.Num === "" ||
                contextContainer.subChildren[0].el.attr.Num === "1"
            )
        ) {
            return locate(
                contextContainer.subChildren[0],
                path,
                processedFragments,
            );
        }

        const cs = contextContainer.subChildren.filter(c => (
            (c.el.tag === fragment.tag) &&
            (
                (fragment.num === null) ||
                ("Num" in c.el.attr && c.el.attr.Num === fragment.num)
            ) &&
            fragment.attr.every(({ key, value }) => (key in c.el.attr && c.el.attr[key] === value))
        ));
        const c = (
            (fragment.nth)
                ? cs[Number(fragment.nth) - 1]
                : cs[0]
        );
        if (c) return locate(
            c,
            path.slice(1),
            [...processedFragments, { container: c, pathFragment: fragment }],
        );
    }
    else { throw assertNever(fragment); }

    return {
        ok: false,
        errors: [
            new ErrorMessage(
                `Cannot locate ${fragment.text} in <${contextContainer.el.tag}${Object.entries(contextContainer.el.attr).map(([key, value]) => " " + (value === undefined ? key : (key + "=\"" + value + "\""))).join("")} />`,
                [processedFragments.length, processedFragments.length + path.length],
            ),
        ],
        partialValue: processedFragments.length === 0 ? null : {
            container: processedFragments[processedFragments.length - 1].container,
            fragments: processedFragments,
        },
    };
};
export default locate;
