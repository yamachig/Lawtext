
import { fetchPartialLaw } from "lawtext/dist/src/elaws_api";
import * as std from "lawtext/dist/src/law/std";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL";
import addSentenceChildrenControls from "lawtext/dist/src/parser/addSentenceChildrenControls";
import { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLAnyELs } from "lawtext/dist/src/renderer/rules/any";
import React from "react";


export interface ElawsPartialLawViewProps { lawNum: string, article?: string, paragraph?: string, appdxTable?: string }

export const ElawsPartialLawView = (props: HTMLComponentProps & ElawsPartialLawViewProps) => {
    const { lawNum, article, paragraph, appdxTable, htmlOptions } = props;

    const [{ loading, el }, setState] = React.useState({ loading: true, el: (null as std.StdEL | null) });

    React.useEffect(() => {
        (async () => {
            const xml = await fetchPartialLaw({ lawNum, article, paragraph, appdxTable });
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
            addSentenceChildrenControls(el);
            setState({ loading: false, el });
        })();
    }, [appdxTable, article, lawNum, paragraph]);

    if (loading) {
        return <div>e-Gov法令APIから法令データを取得しています...</div>;
    }

    if (!el) {
        return <div>e-Gov法令APIから法令データを取得できませんでした。</div>;
    }

    return (<HTMLAnyELs els={[el]} indent={0} {...{ htmlOptions }} />);
};

export default ElawsPartialLawView;
