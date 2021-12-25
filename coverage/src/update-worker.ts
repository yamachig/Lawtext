// import formatXML from "xml-formatter";
import { DOMParser } from "@xmldom/xmldom";
import * as law_diff from "@coresrc/diff/law_diff";
import * as parser_wrapper from "@coresrc/parser_wrapper";
import { render as renderLawtext } from "@coresrc/renderers/lawtext";
import { FSStoredLoader } from "@coresrc/data/loaders/FSStoredLoader";
import { Loader } from "@coresrc/data/loaders/common";
import { EL, parseLawNum, xmlToJson } from "@coresrc/util";
import { BaseLawInfo } from "@coresrc/data/lawinfo";
import { Era, LawCoverage, LawType } from "./lawCoverage";
import { connect, ConnectionInfo } from "./connection";
import config from "./config";
import { Law } from "./std_law";
import { isMainThread, workerData, parentPort } from "worker_threads";

const domParser = new DOMParser();


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


const getOriginalLaw = async (lawInfo: BaseLawInfo, loader: Loader): Promise<{
    origEL?: EL,
    origXML?: string,
    lawNumStruct?: {
        Era: Era | null,
        Year: number | null,
        LawType: LawType | null,
        Num: number | null,
    },
    originalLaw: Required<LawCoverage>["originalLaw"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const origXML = await loader.loadLawXMLByInfo(lawInfo);
        requiredms.set("loadXML", lap.lapms());

        const origEL = xmlToJson(origXML) as Law;
        requiredms.set("xmlToJson", lap.lapms());

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
            originalLaw: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getRenderedLawtext = async (origEL: EL): Promise<{
    lawtext?: string,
    renderedLawtext: Required<LawCoverage>["renderedLawtext"],
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
            renderedLawtext: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getParsedLaw = async (lawtext: string): Promise<{
    parsedEL?: EL,
    parsedXML?: string,
    parsedLaw: Required<LawCoverage>["parsedLaw"],
}> => {
    try {
        const requiredms = new Map<string, number>();
        const lap = new Lap();

        const parsedEL = parser_wrapper.parse(lawtext);
        requiredms.set("parseLawtext", lap.lapms());

        parser_wrapper.analyze(parsedEL);
        requiredms.set("analyze", lap.lapms());

        const parsedXML = parsedEL.outerXML(false);
        requiredms.set("parsedELToXML", lap.lapms());

        return {
            parsedEL,
            parsedXML,
            parsedLaw: {
                ok: {
                    requiredms,
                },
                info: {},
            },
        };
    } catch (e) {
        return {
            parsedLaw: {
                info: { error: (e as Error).stack },
            },
        };
    }
};


const getLawDiff = async (origXML: string, origEL: EL, parsedXML: string, parsedEL: EL, max_diff_length: number): Promise<{
    lawDiff: Required<LawCoverage>["lawDiff"],
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
                info: { error: (e as Error).stack },
            },
        };
    }
};

export const update = async (lawInfo: BaseLawInfo, maxDiffLength: number, db: ConnectionInfo, loader: Loader) => {

    const updateDate = new Date();

    const { origEL, origXML, lawNumStruct: lawNumStructFromXML, originalLaw } = await getOriginalLaw(lawInfo, loader);

    const { lawtext, renderedLawtext } = origEL
        ? await getRenderedLawtext(origEL)
        : { lawtext: undefined, renderedLawtext: undefined };

    const { parsedEL, parsedXML, parsedLaw } = lawtext
        ? await getParsedLaw(lawtext)
        : { parsedEL: undefined, parsedXML: undefined, parsedLaw: undefined };

    const { lawDiff } = (origXML && origEL && parsedXML && parsedEL)
        ? await getLawDiff(origXML, origEL, parsedXML, parsedEL, maxDiffLength)
        : { lawDiff: undefined };

    const lawNumStruct = lawNumStructFromXML ?? parseLawNum(lawInfo.LawNum);

    const doc: LawCoverage = {
        ...lawInfo,
        Era: (lawNumStruct.Era ?? undefined) as Era | undefined,
        Year: lawNumStruct.Year ?? undefined,
        LawType: (lawNumStruct.LawType ?? undefined) as LawType | undefined,
        Num: lawNumStruct.Num ?? undefined,
        updateDate,
        originalLaw,
        renderedLawtext,
        parsedLaw,
        lawDiff,
    };

    await db.lawCoverage.updateOne(
        { LawID: lawInfo.LawID },
        doc,
        {
            upsert: true,
        },
    );

};

const run = async (): Promise<void> => {
    const db = await connect(config.MONGODB_URI);
    const loader = new FSStoredLoader(config.DATA_PATH);
    const maxDiffLength = workerData.maxDiffLength as number;

    parentPort?.on("message", async (msg) => {
        const lawInfo = msg.lawInfo as BaseLawInfo;
        await update(lawInfo, maxDiffLength, db, loader);
        parentPort?.postMessage({ finished: true });
    });

    parentPort?.postMessage({ ready: true });
};

if (!isMainThread) run();

