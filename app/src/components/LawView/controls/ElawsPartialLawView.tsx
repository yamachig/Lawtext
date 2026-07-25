import * as std from "lawtext/dist/src/law/std/index.js";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL.js";
import { detectPointers } from "lawtext/dist/src/analyzer/detectPointers.js";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html.js";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any.js";
import * as elawsApi from "lawtext/dist/src/elawsOpenapi/index.js";
import React from "react";
import { parseNamedNum } from "lawtext/dist/src/law/num.js";
import { decodeBase64 } from "lawtext/dist/src/util/index.js";


export interface ElawsPartialLawViewProps {
    lawTitle?: string,
    lawNum: string,
    article?: string,
    paragraph?: string,
    appdxTable?: string,
}

export const ElawsPartialLawView = (props: HTMLComponentProps & ElawsPartialLawViewProps) => {
    const { lawTitle, lawNum, article, paragraph, appdxTable, htmlOptions } = props;

    const [{ loading, el }, setState] = React.useState({ loading: true, el: (null as std.StdEL | null) });

    React.useEffect(() => {
        (async () => {
            const elData = (await elawsApi.getLawData({
                throwOnError: true,
                path: {
                    law_id_or_num_or_revision_id: lawNum,
                },
                query: {
                    response_format: "json",
                    law_full_text_format: "xml",
                    elm: [
                        "MainProvision",
                        ...(article ? [`Article_${parseNamedNum(article)}`] : []),
                        ...(paragraph ? [`Paragraph_${parseNamedNum(paragraph)}`] : []),
                        ...(appdxTable ? [`AppdxTable_${parseNamedNum(appdxTable)}`] : []),
                    ].join("-"),
                },
            })).data;
            const el = xmlToEL(new TextDecoder().decode(decodeBase64(elData.law_full_text as string))) as std.StdEL;
            if (std.isParagraph(el)) {
                let paragraphNum = el.children.find(std.isParagraphNum);
                if (paragraphNum && paragraphNum.text() === "" && el.attr.Num === "1") {
                    paragraphNum.children.push("１");
                } else if (!paragraphNum) {
                    paragraphNum = std.newStdEL("ParagraphNum", {}, el.attr.Num === "1" ? ["１"] : [paragraph ?? ""]);
                    el.children.unshift(paragraphNum);
                }
                if (article){
                    paragraphNum.children.unshift(`${article}／`);
                }
            }
            const law = std.newStdEL("Law", {}, [
                std.newStdEL("LawNum", {}, [lawNum]),
                std.newStdEL("LawBody", {}, [
                    ...(lawTitle ? [std.newStdEL("LawTitle", {}, [lawTitle])] : []),
                    std.newStdEL("MainProvision", {}, [el]),
                ]),
            ]);
            detectPointers(law);
            setState({ loading: false, el: law });
        })();
    }, [appdxTable, article, lawNum, lawTitle, paragraph]);

    if (loading) {
        return <div className="text-secondary"><span className="spinner-border" style={{ width: "1em", height: "1em" }}role="status"/> e-Gov法令APIから法令データを取得しています...</div>;
    }

    if (!el) {
        return <div>e-Gov法令APIから法令データを取得できませんでした。</div>;
    }

    return (<HTMLAnyELs els={[el]} indent={0} {...{ htmlOptions }} />);
};

export default ElawsPartialLawView;
