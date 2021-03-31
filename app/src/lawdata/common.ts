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

export const toLawData = <TLawDataProps extends LawDataProps>(props: TLawDataProps): LawDataResult<TLawDataProps> => {
    const _props = props as LawDataProps;
    try {
        if (isStoredLawDataProps(_props) || isElawsLawDataProps(_props) || isTempXMLLawDataProps(_props) || isFileXMLLawDataProps(_props)) {
            const el = util.xmlToJson(_props.xml) as std.Law;
            analyzer.stdxmlToExt(el);
            const analysis = analyzer.analyze(el);
            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el,
                    analysis,
                },
            };
        } else if (isTempLawtextLawDataProps(_props) || isFileLawtextLawDataProps(_props)) {
            const el = parse(_props.lawtext, { startRule: "start" }) as std.Law;
            const analysis = analyzer.analyze(el);
            return {
                ok: true,
                lawData: {
                    ...(_props as typeof props),
                    el,
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
