import { Span } from "../../node/span";
import * as std from "../../law/std";
import { lawTypes } from "../../law/num";
import { isJsonEL } from "../../node/el/jsonEL";
import getScope from "../getScope";
import { Pos } from "../common/pos";
import { ____Declaration } from "../common/declaration";


export const detectNameList = (spans: Span[], spanIndex: number): ____Declaration[] => {
    const ret: ____Declaration[] = [];

    let columnsMode = true;
    let paragraphMatch = /([^。\r\n]+?)において、?[次左]の各号に掲げる用語の意義は、(?:それぞれ)?当該各号に定めるところによる。$/.exec(spans[spanIndex].text);
    if (!paragraphMatch) {
        columnsMode = false;
        paragraphMatch = /^(.+?)(?:及びこの法律に基づく命令)?(?:において次に掲げる用語は、|の規定の解釈に(?:ついて|関して)は、)次の定義に従うものとする。$/.exec(spans[spanIndex].text);
        if (!paragraphMatch) return ret;
    }

    const paragraph = spans[spanIndex].env.container;
    for (const item of paragraph.parent?.children ?? []) {
        const sentence = item.el.children.find(el => isJsonEL(el) && (std.paragraphItemSentenceTags as unknown as string[]).includes(el.tag));
        if (!sentence || !isJsonEL(sentence)) continue;

        let nameSpan: Span|null = null;
        let name: string|null = null;
        let value: string|null = null;
        if (columnsMode) {
            if (sentence.children.length < 2) continue;

            const [nameCol, valCol] = sentence.children;
            if (!isJsonEL(nameCol) || !isJsonEL(valCol)) continue;

            name = nameCol.text();
            value = valCol.text();

            for (let i = item.spanRange[0]; i < item.spanRange[1]; i++) {
                if (spans[i].env.parents.includes(nameCol)) nameSpan = spans[i];
            }
        } else {
            let defStartSpanI: number | null = null;
            for (let i = item.spanRange[0]; i < item.spanRange[1]; i++) {
                if (spans[i].env.parents.includes(sentence)) {
                    defStartSpanI = i;
                    break;
                }
            }
            if (defStartSpanI === null) continue;
            const [
                nameStartSpan,
                _nameSpan,
                nameEndSpan,
                ...nameAfterSpans
            ] = spans.slice(defStartSpanI, item.spanRange[1]);
            const nameAfterSpansText = nameAfterSpans.map(s => s.text).join();
            const nameAfterMatch = /^とは、(.+)をいう。(?!）)/.exec(nameAfterSpansText);
            if (
                nameStartSpan.el.tag === "__PStart" &&
                nameStartSpan.el.attr.type === "square" &&
                nameEndSpan.el.tag === "__PEnd" &&
                nameEndSpan.el.attr.type === "square" &&
                nameAfterMatch
            ) {
                nameSpan = _nameSpan;
                name = nameSpan.text;
                value = nameAfterMatch[1];
            }
        }

        if (nameSpan === null || name === null || value === null) continue;

        const scopeText = paragraphMatch[1] || null;

        const scope = !scopeText
            ? [
                {
                    startSpanIndex: spanIndex,
                    startTextIndex: 0,
                    endSpanIndex: spans.length,
                    endTextIndex: 0,
                },
            ]
            : lawTypes.some(([ptn]) => {
                const re = new RegExp(`^この${ptn}`);
                return re.exec(scopeText);
            })
                ? [
                    {
                        startSpanIndex: 0,
                        startTextIndex: 0,
                        endSpanIndex: spans.length,
                        endTextIndex: 0,
                    },
                ]
                : getScope(
                    spans[spanIndex], // currentSpan
                    scopeText, // scopeText
                    false, // following
                    spanIndex, // followingIndex
                );

        const namePos: Pos = {
            spanIndex: nameSpan.index,
            textIndex: 0,
            length: nameSpan.text.length,
            range: nameSpan.el.range,
        };

        const range = nameSpan.el.range ? [
            nameSpan.el.range[0],
            nameSpan.el.range[0] + nameSpan.text.length,
        ] as [number, number] : null;

        const declaration = new ____Declaration({
            type: "Keyword",
            name: name,
            value: value,
            scope: scope,
            namePos: namePos,
            range,
        });

        nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);

        ret.push(declaration);
    }
    return ret;
};

export default detectNameList;
