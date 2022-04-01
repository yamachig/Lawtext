import * as std from "../law/std";
import * as analyzer from "../analyzer";
import * as util from "../util";
import { parse } from "../parser/lawtext";
import { xmlToJson } from "../node/el";
import { ErrorMessage } from "../parser/cst/error";


export interface LawDataCore {el: std.Law, analysis: analyzer.Analysis}

export interface BaseXMLLawDataProps {
    xml: string,
}
export interface BaseLawtextLawDataProps {
    lawtext: string,
}

export type BaseLawDataProps = BaseXMLLawDataProps | BaseLawtextLawDataProps;

export type LawDataResult<TLawDataProps extends BaseLawDataProps> =
    { ok: true, lawData: LawDataCore & TLawDataProps, lawtextErrors?: ErrorMessage[]} | {ok: false, error: Error};

export class Timing {
    public searchLawNum: number | null = null;
    public fetchStoredLawInfo: number | null = null;
    public loadData: number | null = null;
    public extractPict: number | null = null;
    public parseXMLOrLawtext: number | null = null;
    public addControlTags: number | null = null;
    public analyze: number | null = null;
    public updateComponents: number | null = null;

    public toString(): string {
        return `
Timing {
    searchLawNum: ${this.searchLawNum} ms,
    fetchStoredLawInfo: ${this.fetchStoredLawInfo} ms,
    loadData: ${this.loadData} ms,
    extractPict: ${this.extractPict} ms,
    parseXMLOrLawtext: ${this.parseXMLOrLawtext} ms,
    addControlTags: ${this.addControlTags} ms,
    analyze: ${this.analyze} ms,
    updateComponents: ${this.updateComponents} ms,
}
`.trim();
    }
}

export const toLawData = async <TLawDataProps extends BaseLawDataProps>(
    props: TLawDataProps,
    onMessage: (message: string) => unknown,
    timing: Timing,
): Promise<LawDataResult<TLawDataProps>> => {
    const _props = props as BaseLawDataProps;
    try {
        if ("xml" in _props) {

            onMessage("法令XMLをパースしています...");
            // console.log("toLawData: parsing law xml...");
            await util.wait(30);
            const [parseXMLOrLawtextTime, el] = await util.withTime(xmlToJson)(_props.xml);
            timing.parseXMLOrLawtext = parseXMLOrLawtextTime;

            onMessage("制御タグを追加しています...");
            // console.log("onNavigated: adding control tags...");
            await util.wait(30);
            const [addControlTagsTime] = await util.withTime(analyzer.stdxmlToExt)(el);
            timing.addControlTags = addControlTagsTime;

            onMessage("法令を解析しています...");
            // console.log("onNavigated: analysing law...");
            await util.wait(30);
            const [analyzeTime, analysis] = await util.withTime(analyzer.analyze)(el);
            timing.analyze = analyzeTime;

            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el: el as std.Law,
                    analysis,
                },
            };
        } else if ("lawtext" in _props) {

            onMessage("Lawtextをパースしています...");
            // console.log("onNavigated: parsing lawtext...");
            await util.wait(30);
            const [parseXMLOrLawtextTime, { value: el, errors }] = await util.withTime(parse)(_props.lawtext);
            timing.parseXMLOrLawtext = parseXMLOrLawtextTime;

            onMessage("法令を解析しています...");
            // console.log("onNavigated: analysing law...");
            await util.wait(30);
            const [analyzeTime, analysis] = await util.withTime(analyzer.analyze)(el);
            timing.analyze = analyzeTime;

            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el: el as std.Law,
                    analysis,
                },
                lawtextErrors: errors,
            };
        } else {
            throw util.assertNever(_props);
        }
    } catch (origError) {
        const error = new Error(`読み込んだ法令データにエラーがあります: ${origError}`);
        error.stack = `${error.stack}
    Original Error:
    ${(origError as Error).stack}
    `;
        return {
            ok: false,
            error,
        };
    }
};
