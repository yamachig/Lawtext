import * as std from "@coresrc/std_law";
import * as analyzer from "@coresrc/analyzer";
import * as util from "@coresrc/util";
import { parse } from "@coresrc/parser_wrapper";

export interface StoredLawDataProps {
    source: "stored",
    xml: string,
    lawPath: string,
}
export const isStoredLawDataProps = (props: LawDataProps):
    props is StoredLawDataProps =>
    props.source === "stored";

export interface ElawsLawDataProps {
    source: "elaws",
    xml: string,
    pict: Map<string, Blob> | null,
}
export const isElawsLawDataProps = (props: LawDataProps):
    props is ElawsLawDataProps =>
    props.source === "elaws";

export interface TempXMLLawDataProps {
    source: "temp_xml",
    xml: string,
}
export const isTempXMLLawDataProps = (props: LawDataProps):
    props is TempXMLLawDataProps =>
    props.source === "temp_xml";

export interface FileXMLLawDataProps {
    source: "file_xml",
    xml: string,
}
export const isFileXMLLawDataProps = (props: LawDataProps):
    props is FileXMLLawDataProps =>
    props.source === "file_xml";

export interface TempLawtextLawDataProps {
    source: "temp_lawtext",
    lawtext: string,
}
export const isTempLawtextLawDataProps = (props: LawDataProps):
    props is TempLawtextLawDataProps =>
    props.source === "temp_lawtext";

export interface FileLawtextLawDataProps {
    source: "file_lawtext",
    lawtext: string,
}
export const isFileLawtextLawDataProps = (props: LawDataProps):
    props is FileLawtextLawDataProps =>
    props.source === "file_lawtext";

export type LawDataProps = StoredLawDataProps | ElawsLawDataProps | TempXMLLawDataProps | FileXMLLawDataProps | TempLawtextLawDataProps | FileLawtextLawDataProps;

export interface LawDataCore {el: std.Law, analysis: analyzer.Analysis}

export type LawData = LawDataProps & LawDataCore;

export type LawDataResult<TLawDataProps extends LawDataProps = LawDataProps> =
    { ok: true, lawData: LawDataCore & TLawDataProps} | {ok: false, error: Error};
export class Timing {
    public searchLawNum: number | null = null;
    public fetchStoredLawInfo: number | null = null;
    public loadData: number | null = null;
    public extractPict: number | null = null;
    public parseXMLOrLawtext: number | null = null;
    public addControlTags: number | null = null;
    public analyze: number | null = null;
    public render: number | null = null;

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
    render: ${this.render} ms,
}
`.trim();
    }
}

export const toLawData = async <TLawDataProps extends LawDataProps>(
    props: TLawDataProps,
    onMessage: (message: string) => unknown,
    timing: Timing,
): Promise<LawDataResult<TLawDataProps>> => {
    const _props = props as LawDataProps;
    try {
        if (isStoredLawDataProps(_props) || isElawsLawDataProps(_props) || isTempXMLLawDataProps(_props) || isFileXMLLawDataProps(_props)) {

            onMessage("法令XMLをパースしています...");
            console.log("toLawData: parsing law xml...");
            await util.wait(30);
            const [parseXMLOrLawtextTime, el] = await util.withTime(util.xmlToJson)(_props.xml);
            timing.parseXMLOrLawtext = parseXMLOrLawtextTime;

            onMessage("制御タグを追加しています...");
            console.log("onNavigated: adding control tags...");
            await util.wait(30);
            const [addControlTagsTime] = await util.withTime(analyzer.stdxmlToExt)(el);
            timing.addControlTags = addControlTagsTime;

            onMessage("法令を解析しています...");
            console.log("onNavigated: analysing law...");
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
        } else if (isTempLawtextLawDataProps(_props) || isFileLawtextLawDataProps(_props)) {

            onMessage("Lawtextをパースしています...");
            console.log("onNavigated: parsing lawtext...");
            await util.wait(30);
            const [parseXMLOrLawtextTime, el] = await util.withTime(parse)(_props.lawtext, { startRule: "start" });
            timing.parseXMLOrLawtext = parseXMLOrLawtextTime;

            onMessage("法令を解析しています...");
            console.log("onNavigated: analysing law...");
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
        } else {
            throw util.assertNever(_props);
        }
    } catch (origError) {
        const error = new Error(`読み込んだ法令データにエラーがあります: ${origError}`);
        error.stack = `${error.stack}
    Original Error:
    ${origError.stack}
    `;
        return {
            ok: false,
            error,
        };
    }
};
