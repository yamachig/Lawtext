import chai from "chai";
import { it } from "mocha";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lawDiff, LawDiffMode, ProblemStatus } from "../src/diff/law_diff";
import { TERMC, toTableText } from "../src/util/term";
import * as util from "../src/util";
import renderAndParse from "./renderAndParse";
import makeDiffTable from "./makeDiffTable";

const LIMIT_WIDTH = 34;

describe("Test Renderes", () => {

    const lawNums = ["平成五年法律第八十八号"];
    // lawNums.splice(0, lawNums.length);

    for (const lawNum of lawNums) {
        it(`Render and Parse: ${lawNum}`, async () => {
        // const [list, listByLawnum] = await getLawList();
        // chai.assert(false);

            const renderAndParseResult = await renderAndParse(lawNum);
            if (!renderAndParseResult) return;
            const { origEL, parsedEL, origDOM, parsedDOM, tempOrigXml, tempRenderedLawtext, tempRenderedHTML, tempRenderedDocx, tempParsedXml } = renderAndParseResult;

            const diff = lawDiff(origEL.json(false), (parsedEL.json(false)), LawDiffMode.WarningAsNoDiff);

            const table = makeDiffTable(diff, origDOM, parsedDOM);

            if (diff.mostSeriousStatus !== ProblemStatus.NoProblem) {
                const legend = `Legend: Error(${TERMC.YELLOW}*Change${TERMC.DEFAULT}, ${TERMC.GREEN}+Add${TERMC.DEFAULT}, ${TERMC.MAGENTA}-Remove${TERMC.DEFAULT}), ${TERMC.CYAN}Warning${TERMC.DEFAULT}, ${TERMC.BLUE}NoProblem${TERMC.DEFAULT}`;
                const mssStr = (diff.mostSeriousStatus === ProblemStatus.Error)
                    ? `${TERMC.RED}Error${TERMC.DEFAULT}`
                    : (diff.mostSeriousStatus === ProblemStatus.Warning)
                        ? `${TERMC.CYAN}Warning${TERMC.DEFAULT}`
                        : util.assertNever(diff.mostSeriousStatus);
                const msg = [
                    legend,
                    `Original XML: "${tempOrigXml}"`,
                    `Rendered Lawtext: "${tempRenderedLawtext}"`,
                    `Rendered HTML: "${tempRenderedHTML}"`,
                    `Rendered Docx: "${tempRenderedDocx}"`,
                    `Parsed XML: "${tempParsedXml}"`,
                    `Most serious status: ${mssStr}`,
                    toTableText(table, LIMIT_WIDTH),
                    legend,
                    `View XML: "${tempOrigXml}"`,
                    `Rendered Lawtext: "${tempRenderedLawtext}"`,
                    `Rendered HTML: "${tempRenderedHTML}"`,
                    `Rendered Docx: "${tempRenderedDocx}"`,
                    `Parsed XML: "${tempParsedXml}"`,
                    `Most serious status: ${mssStr}`,
                    "",
                ].join("\r\n");

                chai.assert(false, `\x1b\r\n\r\n[39m${msg}`);
            }

        });
    }
});
