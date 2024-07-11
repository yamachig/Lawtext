import chai from "chai";
import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { promisify } from "util";
import xmldom from "@xmldom/xmldom";
import { parse } from "../src/parser/lawtext";
import { analyze } from "../src/analyzer";
import { renderDocxAsync, renderHTML, renderLawtext } from "../src/renderer";
import { TERMC } from "../src/util/term";
import { ErrorMessage } from "../src/parser/cst/error";
import formatXML from "../src/util/formatXml";
import { xmlToEL } from "../src/node/el/xmlToEL";
import { outerXML } from "../src/node/el/elToXML";
import { Loader } from "../src/data/loaders/common";
import { getMemorizedStringOffsetToPos } from "generic-parser";
import { lawNumLikeToLawNum } from "../src/law/lawNum";
import ensureTempTestDir from "./ensureTempTestDir";
import FigDataManager from "../src/renderer/common/docx/FigDataManager";

const domParser = new xmldom.DOMParser();

const renderAndParse = async (loader: Loader, lawNum: string) => {

    const lawInfo = await loader.getLawInfoByLawNum(lawNumLikeToLawNum(lawNum));
    if (lawInfo === null) throw Error("LawInfo not found");
    const lawXMLStruct = await loader.loadLawXMLStructByInfo(lawInfo);
    const { xml: origXML } = lawXMLStruct;
    if (origXML === null) throw new Error(`XML cannot be fetched: ${lawInfo.LawID}`);
    console.log(`${TERMC.CYAN}Temporary directory: "${ensureTempTestDir()}"${TERMC.DEFAULT}`);
    const tempOrigXml = path.join(ensureTempTestDir(), `${lawInfo.LawID}.orig.xml`);
    const tempRenderedLawtext = path.join(ensureTempTestDir(), `${lawInfo.LawID}.rendered.law.txt`);
    const tempRenderedHTML = path.join(ensureTempTestDir(), `${lawInfo.LawID}.rendered.html`);
    const tempRenderedDocx = path.join(ensureTempTestDir(), `${lawInfo.LawID}.rendered.docx`);
    const tempParsedXml = path.join(ensureTempTestDir(), `${lawInfo.LawID}.parsed.xml`);

    const origDOM = domParser.parseFromString(origXML);
    await promisify(fs.writeFile)(tempOrigXml, origXML, { encoding: "utf-8" });

    const origEL = xmlToEL(origXML);

    let lawtext: string;
    try {
        lawtext = renderLawtext(origEL);
    } catch (e) {
        const msg = [
            `${TERMC.CYAN}Original XML: "${tempOrigXml}"${TERMC.DEFAULT}`,
            "",
        ].join("\r\n");
        console.error(msg);
        throw e;
    }

    const html = renderHTML(origEL);

    const figDataManager = await FigDataManager.create({ lawXMLStruct, subsetLaw: origEL });
    const docx = await renderDocxAsync(origEL, { figDataManager });

    await promisify(fs.writeFile)(tempRenderedLawtext, lawtext, { encoding: "utf-8" });
    await promisify(fs.writeFile)(tempRenderedHTML, html, { encoding: "utf-8" });
    await promisify(fs.writeFile)(tempRenderedDocx, docx);

    let parsedEL;
    let errors: ErrorMessage[];
    try {
        const result = parse(lawtext);
        const offsetToPos = getMemorizedStringOffsetToPos();
        parsedEL = result.value;
        const ignoreErrorMessages = [
            "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
            "$MISMATCH_END_PARENTHESIS: この括弧に対応する開き括弧がありません。",
        ];
        errors = result.errors.filter(e => !ignoreErrorMessages.includes(e.message));

        const errorTexts: string[] = [];
        errorTexts.push("\n");
        for (const e of errors.slice(0, 7)) {
            const text = lawtext.slice(...e.range);
            const [start] = e.range.map(o => offsetToPos(lawtext, o));
            errorTexts.push(`At ${tempRenderedLawtext}:${start.line}:${start.column}`);
            errorTexts.push(`"${text}"`);
            errorTexts.push(`=> ${e.message}`);
            errorTexts.push("\n");
        }
        if (errors.length > 7) {
            errorTexts.push("\n... more errors ...");
        }
        const errorText = errorTexts.join("\n");
        chai.assert( errors.length === 0, errorText);
        if (parsedEL === undefined) return;
    } catch (e) {
        const msg = [
            `Original XML: "${tempOrigXml}"`,
            `Rendered Lawtext: "${tempRenderedLawtext}"`,
            "",
        ].join("\r\n");
        console.error(msg);
        throw e;
    }

    analyze(parsedEL);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const parsedXML = formatXML(outerXML(parsedEL)) as string;
    const parsedDOM = domParser.parseFromString(parsedXML);
    await promisify(fs.writeFile)(tempParsedXml, parsedXML, { encoding: "utf-8" });

    return { origEL, parsedEL, origDOM, parsedDOM, tempOrigXml, tempRenderedLawtext, tempRenderedHTML, tempRenderedDocx, tempParsedXml } ;
};

// if (typeof require !== "undefined" && require.main === module) {
//     console.log("running renderAndParse() from toplevel.");
//     process.on("unhandledRejection", e => {
//         // const newErr = new Error(`Unhandled rejection in prepare(): ${e}`);
//         console.log();
//         console.dir(e);
//         // console.error(newErr);
//         process.exit(1);
//     });

//     const lawNums = [
//         "平成五年法律第八十八号",
//         "昭和二十五年法律第百三十一号",
//         "昭和五十九年法律第八十六号",
//         "昭和二十二年法律第六十七号",
//     ];
//     // lawNums.splice(0, lawNums.length);

//     (async () => {
//         for (const lawNum of lawNums) {
//             await renderAndParse(loader, lawNum);
//         }
//     })();

// }

export default renderAndParse;
