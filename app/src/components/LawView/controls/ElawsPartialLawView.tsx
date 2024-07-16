
import { fetchPartialLaw } from "lawtext/dist/src/elawsApi";
import * as std from "lawtext/dist/src/law/std";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL";
import addSentenceChildrenControls from "lawtext/dist/src/parser/addSentenceChildrenControls";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import React from "react";


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
            const xml = await fetchPartialLaw({
                lawNum,
                article: article?.replace("ノ", "の"),
                paragraph,
                appdxTable,
            });
            const el = xmlToEL(xml) as std.StdEL;
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
            addSentenceChildrenControls(law);
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
