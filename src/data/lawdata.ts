import * as std from "../law/std";
import * as analyzer from "../analyzer";
import * as util from "../util";
import { parse } from "../parser/lawtext";
import { EL } from "../node/el";
import { ErrorMessage } from "../parser/cst/error";
import { LawXMLStruct } from "./loaders/common";
import { ElawsLawData } from "../elaws_api";
import { xmlToEL } from "../node/el/xmlToEL";
import addControls from "../parser/addControls";


export interface LawDataCore {
    el: std.Law,
    analysis: analyzer.Analysis,
    pictURL: Map<string, {url: string, type: string}>;
}

export interface BaseXMLLawDataProps {
    xml: string,
    lawXMLStruct: LawXMLStruct | null,
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

function *findFig(el: EL): Iterable<std.Fig> {
    if (std.isFig(el)) {
        yield el;
    }
    for (const child of el.children) {
        if (typeof child === "string") continue;
        yield* findFig(child);
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
            const [parseXMLOrLawtextTime, el] = await util.withTime(xmlToEL)(_props.xml);
            timing.parseXMLOrLawtext = parseXMLOrLawtextTime;

            onMessage("制御タグを追加しています...");
            // console.log("onNavigated: adding control tags...");
            await util.wait(30);
            const [addControlTagsTime] = await util.withTime(addControls)(el);
            timing.addControlTags = addControlTagsTime;

            onMessage("法令を解析しています...");
            // console.log("onNavigated: analysing law...");
            await util.wait(30);
            const [analyzeTime, analysis] = await util.withTime(analyzer.analyze)(el);
            timing.analyze = analyzeTime;

            const pictURL = new Map<string, {url: string, type: string}>();
            const lawXMLStruct = _props.lawXMLStruct;
            if (lawXMLStruct) {
                onMessage("画像情報を読み込んでいます...");
                await util.wait(30);
                const start = new Date();
                if (lawXMLStruct instanceof ElawsLawData) {
                    const pict = await lawXMLStruct.ensurePict();
                    if (pict) {
                        for (const [src] of pict.entries()) {
                            const url = await lawXMLStruct.getPictFileOrBlobURL(src);
                            if (url) pictURL.set(src, url);
                        }
                    }
                } else {
                    for (const fig of findFig(el)) {
                        const src = fig.attr.src;
                        if (!src) continue;
                        const url = await lawXMLStruct.getPictFileOrBlobURL(src);
                        if (url) pictURL.set(src, url);
                    }
                }
                timing.extractPict = (new Date()).getTime() - start.getTime();
            }


            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el: el as std.Law,
                    analysis,
                    pictURL,
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
                    pictURL: new Map(),
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
