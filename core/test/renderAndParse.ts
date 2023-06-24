import chai from "chai";
import fs from "fs";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { promisify } from "util";
import xmldom from "@xmldom/xmldom";
import { parse } from "../src/parser/lawtext";
import { analyze } from "../src/analyzer";
import { renderDocxAsync, renderHTML, renderLawtext } from "../src/renderer";
import { TERMC } from "../src/util/term";
import { loader } from "./prepare_test";
import { ErrorMessage } from "../src/parser/cst/error";
import formatXML from "../src/util/formatXml";
import { xmlToEL } from "../src/node/el/xmlToEL";
import { outerXML } from "../src/node/el/elToXML";

const domParser = new xmldom.DOMParser();

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

const renderAndParse = async (lawNum: string) => {

    const lawInfo = await loader.getLawInfoByLawNum(lawNum);
    if (lawInfo === null) throw Error("LawInfo not found");
    const { xml: origXML } = await loader.loadLawXMLStructByInfo(lawInfo);
    if (origXML === null) throw new Error(`XML cannot be fetched: ${lawNum}`);
    console.log(`${TERMC.CYAN}Temporary directory: "${tempDir}"${TERMC.DEFAULT}`);
    const tempOrigXml = path.join(tempDir, `${lawNum}.orig.xml`);
    const tempRenderedLawtext = path.join(tempDir, `${lawNum}.rendered.law.txt`);
    const tempRenderedHTML = path.join(tempDir, `${lawNum}.rendered.html`);
    const tempRenderedDocx = path.join(tempDir, `${lawNum}.rendered.docx`);
    const tempParsedXml = path.join(tempDir, `${lawNum}.parsed.xml`);
    await promisify(fsExtra.ensureDir)(tempDir);

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
    const docx = await renderDocxAsync(origEL);

    await promisify(fs.writeFile)(tempRenderedLawtext, lawtext, { encoding: "utf-8" });
    await promisify(fs.writeFile)(tempRenderedHTML, html, { encoding: "utf-8" });
    await promisify(fs.writeFile)(tempRenderedDocx, docx);

    let parsedEL;
    let errors: ErrorMessage[];
    try {
        const result = parse(lawtext);
        parsedEL = result.value;
        const ignoreErrorMessages = [
            "$MISMATCH_START_PARENTHESIS: この括弧に対応する閉じ括弧がありません。",
            "$MISMATCH_END_PARENTHESIS: この括弧に対応する開き括弧がありません。",
        ];
        errors = result.errors.filter(e => !ignoreErrorMessages.includes(e.message));
        chai.assert(
            errors.length === 0,
            `\
${errors.slice(0, 7).map(e => lawtext.slice(...e.range)).join("\n\n")}
${errors.length > 7 ? "\n... more errors ..." : ""}
`);
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

if (typeof require !== "undefined" && require.main === module) {
    console.log("running renderAndParse() from toplevel.");
    process.on("unhandledRejection", e => {
        // const newErr = new Error(`Unhandled rejection in prepare(): ${e}`);
        console.log();
        console.dir(e);
        // console.error(newErr);
        process.exit(1);
    });

    const lawNums = [
        "平成五年法律第八十八号",
        "昭和二十五年法律第百三十一号",
        "昭和五十九年法律第八十六号",
        "昭和二十二年法律第六十七号",
    ];
    // lawNums.splice(0, lawNums.length);

    (async () => {
        for (const lawNum of lawNums) {
            await renderAndParse(lawNum);
        }
    })();

}

export default renderAndParse;
