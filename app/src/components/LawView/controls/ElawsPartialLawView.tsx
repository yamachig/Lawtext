
import { fetchPartialLaw } from "lawtext/dist/src/elaws_api";
import * as std from "lawtext/dist/src/law/std";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL";
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
