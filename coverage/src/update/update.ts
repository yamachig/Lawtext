// import formatXML from "xml-formatter";
import type { Loader } from "lawtext/dist/src/data/loaders/common";
import { parseLawNum } from "lawtext/dist/src/law/lawNum";
import type { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import type { Era, LawCoverage, LawType } from "../lawCoverage";
import type { ConnectionInfo } from "../connection";
import { getLawDiff, getOriginalLaw, getParsedLaw, getRenderedDocx, getRenderedHTML, getRenderedLawtext } from "./transform";
import { pick } from "lawtext/dist/src/util";


export const update = async (lawInfo: BaseLawInfo, maxDiffLength: number, db: ConnectionInfo, loader: Loader) => {

    const updateDate = new Date();

    const { origEL, origXML, lawNumStruct: lawNumStructFromXML, originalLaw } = await getOriginalLaw(lawInfo, loader);

    const { renderedHTML } = origEL
        ? await getRenderedHTML(origEL)
        : { renderedHTML: null };

    const { renderedDocx } = origEL
        ? await getRenderedDocx(origEL)
        : { renderedDocx: null };

    const { lawtext, renderedLawtext } = origEL
        ? await getRenderedLawtext(origEL)
        : { lawtext: null, renderedLawtext: null };

    const { parsedEL, parsedXML, parsedLaw } = lawtext
        ? await getParsedLaw(lawtext)
        : { parsedEL: null, parsedXML: null, parsedLaw: null };

    const { lawDiff } = (origXML && origEL && parsedXML && parsedEL)
        ? await getLawDiff(origXML, origEL, parsedXML, parsedEL, maxDiffLength, pick(lawInfo, "LawID", "LawNum", "LawTitle"))
        : { lawDiff: null };

    const lawNumStruct = lawNumStructFromXML ?? parseLawNum(lawInfo.LawNum);

    const doc: LawCoverage = {
        ...lawInfo,
        Era: (lawNumStruct.Era ?? null) as Era | null,
        Year: lawNumStruct.Year ?? null,
        LawType: (lawNumStruct.LawType ?? null) as LawType | null,
        Num: lawNumStruct.Num ?? null,
        updateDate,
        originalLaw,
        renderedHTML,
        renderedDocx,
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

