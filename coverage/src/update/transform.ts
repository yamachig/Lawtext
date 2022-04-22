// import formatXML from "xml-formatter";
import { DOMParser } from "@xmldom/xmldom";
import * as law_diff from "lawtext/dist/src/diff/law_diff";
import { parse } from "lawtext/dist/src/parser/lawtext";
import * as analyzer from "lawtext/dist/src/analyzer";
import { renderDocxAsync, renderHTML, renderLawtext } from "lawtext/dist/src/renderer";
import { Loader } from "lawtext/dist/src/data/loaders/common";
import { EL } from "lawtext/dist/src/node/el";
import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { Era, LawCoverage, LawType } from "../lawCoverage";
import { Law } from "lawtext/dist/src/law/std";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL";

const domParser = new DOMParser();
type DeNull<T> = T extends null ? never : T;

class Lap {
    date: Date;
    constructor() {
        this.date = new Date();
    }
    lapms() {
        const now = new Date();
        const ms = now.getTime() - this.date.getTime();
        this.date = now;
        return ms;
    }
}


export const getOriginalLaw = async (lawInfo: BaseLawInfo, loader: Loader): Promise<{
    origEL: EL | null,
    origXML: string | null,
    lawNumStruct: {
        Era: Era | null,
        Year: number | null,
        LawType: LawType | null,
        Num: number | null,
    } | null,
    originalLaw: DeNull<LawCoverage["originalLaw"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const xmlStruct = await loader.loadLawXMLStructByInfo(lawInfo);
        const origXML = xmlStruct.xml;
        requiredms.set("loadXML", lap.lapms());

        const origEL = xmlToEL(origXML) as Law;
        requiredms.set("xmlToEL", lap.lapms());

        const Year = Number(origEL.attr.Year);
        const Num = Number(origEL.attr.Num);

        return {
            origEL,
            origXML,
            lawNumStruct: {
                Era: origEL.attr.Era as Era,
                Year: Number.isNaN(Year) ? null : Year,
                Num: Number.isNaN(Num) ? null : Num,
                LawType: origEL.attr.LawType as LawType,
            },
            originalLaw: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            origEL: null,
            origXML: null,
            lawNumStruct: null,
            originalLaw: {
                ok: null,
                info: { error: (e as Error).stack },
            },
        };
    }
};


export const getRenderedHTML = async (origEL: EL): Promise<{
    html: string | null,
    renderedHTML: DeNull<LawCoverage["renderedHTML"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const html = renderHTML(origEL);
        requiredms.set("renderHTML", lap.lapms());

        return {
            html,
            renderedHTML: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            html: null,
            renderedHTML: {
                ok: null,
                info: { error: (e as Error).stack },
            },
        };
    }
};


export const getRenderedDocx = async (origEL: EL): Promise<{
    docx: Uint8Array | Buffer | null,
    renderedDocx: DeNull<LawCoverage["renderedDocx"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const docx = await renderDocxAsync(origEL);
        requiredms.set("renderDocxAsync", lap.lapms());

        return {
            docx,
            renderedDocx: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            docx: null,
            renderedDocx: {
                ok: null,
                info: { error: (e as Error).stack },
            },
        };
    }
};


export const getRenderedLawtext = async (origEL: EL): Promise<{
    lawtext: string | null,
    renderedLawtext: DeNull<LawCoverage["renderedLawtext"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const lawtext = renderLawtext(origEL);
        requiredms.set("renderLawtext", lap.lapms());

        return {
            lawtext,
            renderedLawtext: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            lawtext: null,
            renderedLawtext: {
                ok: null,
                info: { error: (e as Error).stack },
            },
        };
    }
};

const ignoreErrorMessages = [
    "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
    "$MISMATCH_END_PARENTHESIS: この括弧に対応する開き括弧がありません。",
];

export const getParsedLaw = async (lawtext: string): Promise<{
    parsedEL: EL | null,
    parsedXML: string | null,
    parsedLaw: DeNull<LawCoverage["parsedLaw"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const { value: parsedEL, errors: parsedErrors } = parse(lawtext);
        requiredms.set("parseLawtext", lap.lapms());

        analyzer.analyze(parsedEL);
        requiredms.set("analyze", lap.lapms());

        const parsedXML = parsedEL.outerXML(false);
        requiredms.set("parsedELToXML", lap.lapms());

        const allLines = lawtext.split("\n");
        const filteredParsedErrors = parsedErrors.filter(e => !ignoreErrorMessages.includes(e.message));
        let errorText = filteredParsedErrors.length > 0
            ? filteredParsedErrors.slice(0, 7).map(e => e.toString(allLines)).join("\n\n")
            : null;
        if (filteredParsedErrors.length > 7) {
            errorText = (errorText ?? "") + `\n\n... ${filteredParsedErrors.length - 7} more errors ...`;
        }

        return {
            parsedEL,
            parsedXML,
            parsedLaw: {
                ok: {
                    requiredms,
                },
                hasError: Boolean(errorText),
                info: {
                    ...(
                        errorText
                            ? { error: errorText }
                            : {}
                    ),
                },
            },
        };
    } catch (e) {
        return {
            parsedEL: null,
            parsedXML: null,
            parsedLaw: {
                ok: null,
                hasError: true,
                info: { error: (e as Error).stack },
            },
        };
    }
};


export const getLawDiff = async (origXML: string, origEL: EL, parsedXML: string, parsedEL: EL, max_diff_length: number): Promise<{
    lawDiff: DeNull<LawCoverage["lawDiff"]>,
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const origJson = origEL.json(false);
        requiredms.set("origELToJson", lap.lapms());

        const parsedJson = parsedEL.json(false);
        requiredms.set("parsedELToJson", lap.lapms());

        const d = law_diff.lawDiff(origJson, parsedJson, law_diff.LawDiffMode.NoProblemAsNoDiff);
        requiredms.set("lawDiff", lap.lapms());

        const origDOM = domParser.parseFromString(origXML);
        requiredms.set("parseLawtext", lap.lapms());

        const parsedDOM = domParser.parseFromString(parsedXML);
        requiredms.set("parseLawtext", lap.lapms());

        const diffData = law_diff.makeDiffData(d, origDOM, parsedDOM);
        requiredms.set("parseLawtext", lap.lapms());

        let slicedDiffData = diffData;

        if (diffData.length > max_diff_length) {
            const iSerious = Math.max(diffData.findIndex(diff => diff.mostSeriousStatus === d.mostSeriousStatus), 0);
            const iStart = Math.min(iSerious, diffData.length - max_diff_length);
            slicedDiffData = diffData.slice(iStart, iStart + max_diff_length);
        }

        return {
            lawDiff: {
                ok: {
                    mostSeriousStatus: d.mostSeriousStatus,
                    result: {
                        items: slicedDiffData,
                        totalCount: diffData.length,
                    },
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            lawDiff: {
                ok: null,
                info: { error: (e as Error).stack },
            },
        };
    }
};
