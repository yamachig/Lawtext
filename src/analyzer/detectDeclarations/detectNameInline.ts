import { Span } from "../../node/span";
import { ____Declaration } from "../common/declaration";
import { Pos } from "../common/pos";
import getScope, { ScopeRange } from "../getScope";


export const detectNameInline = (spans: Span[], spanIndex: number) => {
    if (spans.length < spanIndex + 5) return null;
    const [
        nameBeforeSpan,
        nameStartSpan,
        nameSpan,
        nameEndSpan,
        nameAfterSpan,
    ] = spans.slice(spanIndex, spanIndex + 5);

    const scopeMatch = /(以下)?(?:([^。]+?)において)?(?:単に)?$/.exec(nameBeforeSpan.text);
    const nameAfterMatch = /^という。/.exec(nameAfterSpan.text);
    if (
        scopeMatch &&
        nameStartSpan.el.tag === "__PStart" &&
        nameStartSpan.el.attr.type === "square" &&
        nameEndSpan.el.tag === "__PEnd" &&
        nameEndSpan.el.attr.type === "square" &&
        nameAfterMatch
    ) {
        const following = scopeMatch[1] !== undefined;
        const scopeText = scopeMatch[2] || null;

        const scope = scopeText
            ? getScope(nameBeforeSpan, scopeText, following, nameAfterSpan.index)
            : [
                new ScopeRange({
                    startSpanIndex: nameAfterSpan.index,
                    startTextIndex: 0,
                    endSpanIndex: spans.length,
                    endTextIndex: 0,
                }),
            ];

        const namePos = new Pos({
            span: nameSpan,
            spanIndex: nameSpan.index,
            textIndex: 0,
            length: nameSpan.text.length,
            env: nameSpan.env,
        });

        const range = nameSpan.el.range ? [
            nameSpan.el.range[0],
            nameSpan.el.range[0] + nameSpan.text.length,
        ] as [number, number] : null;

        const declaration = new ____Declaration({
            type: "Keyword",
            name: nameSpan.text,
            value: null,
            scope: scope,
            namePos: namePos,
            range,
        });

        nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);
        return declaration;
    }

    return null;
};

export default detectNameInline;
