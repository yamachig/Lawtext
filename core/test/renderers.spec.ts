import chai from "chai";
import { it } from "mocha";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lawDiff, LawDiffMode, makeDiffData, ProblemStatus } from "../src/diff/lawDiff";
import { TERMC, toTableText } from "../src/util/term";
import renderAndParse from "./renderAndParse";
import makeDiffTable from "./makeDiffTable";
import { assertLoader } from "./prepareTest";

const LIMIT_WIDTH = 34;
const MAX_DIFF_LENGTH = 20;

describe("Test Renderes", () => {

    const lawNums = [
        "平成五年法律第八十八号",
        "平成十一年法律第百二十七号",
        ...(
            process.env.TEST_RENDERERS_LAWNUMS
                ? process.env.TEST_RENDERERS_LAWNUMS.split(/[\s,;]+/)
                : []
        ),
    ];
    // lawNums.splice(0, lawNums.length);

    for (const lawNum of lawNums) {
        it(`Render and Parse: ${lawNum}`, async function () {

            this.slow(750);
            // const [list, listByLawnum] = await getLawList();
            // chai.assert(false);

            const loader = assertLoader(this);
            const renderAndParseResult = await renderAndParse(loader, lawNum);
            if (!renderAndParseResult) return;
            const { origEL, parsedEL, origDOM, parsedDOM, tempOrigXml, tempRenderedLawtext, tempRenderedHTML, tempRenderedDocx, tempParsedXml } = renderAndParseResult;

            const diff = lawDiff(
                origEL.json(false),
                (parsedEL.json(false)),
                {
                    lawDiffMode: LawDiffMode.NoProblemAsNoDiff,
                    errorContext: lawNum,
                },
            );
            const diffData = makeDiffData(diff, origDOM, parsedDOM);

            let slicedDiffData = diffData;
            if (diffData.length > MAX_DIFF_LENGTH) {
                const iSerious = Math.max(diffData.findIndex(dd => dd.mostSeriousStatus === diff.mostSeriousStatus), 0);
                const iStart = Math.min(iSerious, diffData.length - MAX_DIFF_LENGTH);
                slicedDiffData = diffData.slice(iStart, iStart + MAX_DIFF_LENGTH);
            }

            const table = makeDiffTable(slicedDiffData);

            if (diff.mostSeriousStatus > ProblemStatus.Warning) {
                const legend = `Legend: Error(${TERMC.YELLOW}*Change${TERMC.DEFAULT}, ${TERMC.GREEN}+Add${TERMC.DEFAULT}, ${TERMC.MAGENTA}-Remove${TERMC.DEFAULT}), ${TERMC.CYAN}Warning${TERMC.DEFAULT}, ${TERMC.BLUE}NoProblem${TERMC.DEFAULT}`;
                const mssStr = `${TERMC.RED}Error${TERMC.DEFAULT}`;
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
