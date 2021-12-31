// import formatXML from "xml-formatter";
import { Loader } from "lawtext/dist/src/data/loaders/common";
import { parseLawNum } from "lawtext/dist/src/law/lawUtil";
import { BaseLawInfo } from "lawtext/dist/src/data/lawinfo";
import { Era, LawCoverage, LawType } from "../lawCoverage";
import { ConnectionInfo } from "../connection";
import { getLawDiff, getOriginalLaw, getParsedLaw, getRenderedLawtext } from "./transform";


export const update = async (lawInfo: BaseLawInfo, maxDiffLength: number, db: ConnectionInfo, loader: Loader) => {

    const updateDate = new Date();

    const { origEL, origXML, lawNumStruct: lawNumStructFromXML, originalLaw } = await getOriginalLaw(lawInfo, loader);

    const { lawtext, renderedLawtext } = origEL
        ? await getRenderedLawtext(origEL)
        : { lawtext: null, renderedLawtext: null };

    const { parsedEL, parsedXML, parsedLaw } = lawtext
        ? await getParsedLaw(lawtext)
        : { parsedEL: null, parsedXML: null, parsedLaw: null };

    const { lawDiff } = (origXML && origEL && parsedXML && parsedEL)
        ? await getLawDiff(origXML, origEL, parsedXML, parsedEL, maxDiffLength)
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

