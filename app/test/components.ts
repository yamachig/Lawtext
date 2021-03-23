import chai from "chai";
import { it } from "mocha";
import ReactDOMServer from "react-dom/server";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import { LawView } from "@appsrc/components/LawView";
import { getLawList, getLawXml, TextFetcher } from "@coresrc/data/lawlist";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { LawtextAppPageState } from "./components/LawtextAppPageState";


const textFetcher: TextFetcher = async (textPath: string) => {
    try {
        const text = await promisify(fs.readFile)(textPath, { encoding: "utf-8" });
        return text;
    } catch (e) {
        console.log(e);
        return null;
    }
};

const dataPath = path.join(__dirname, "../../core/data");

const renderAllLaws = async () => {

    const pickedLawNum = "平成二十六年政令第三百九十四号";

    const [list /**/] = await getLawList(dataPath, textFetcher);

    for (const { LawNum: lawNum, LawTitle: lawTitle } of list.filter(o => o.LawNum === pickedLawNum)) {

        it(`${lawTitle}（${lawNum}）`, async () => {

            const origXML = await getLawXml(dataPath, lawNum, textFetcher);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const origEL = util.xmlToJson(origXML!);
            analyze(origEL);

            let currentState: LawtextAppPageState = {
                law: origEL as std.Law,
                loadingLaw: false,
                loadingLawMessage: "",
                lawSearchKey: "",
                lawSearchedKey: "",
                analysis: null,
                hasError: false,
                errors: [],
            };

            const origSetState: React.Dispatch<React.SetStateAction<LawtextAppPageState>> = (newState: LawtextAppPageState | ((prevState: LawtextAppPageState) => LawtextAppPageState)) => {
                currentState = typeof newState === "function" ? newState(currentState) : newState;
            };

            const setState = (newState: Partial<LawtextAppPageState>) => {
                origSetState({ ...currentState, ...newState });
            };

            const renderedElement = LawView({
                origState: currentState,
                setState,
                origSetState,
            }) as JSX.Element;

            void ReactDOMServer.renderToStaticMarkup(renderedElement);

            chai.assert(
                !currentState.hasError,
                [
                    `${lawTitle}（${lawNum}）`,
                    currentState.errors.map(e => `[${e.name}]${e.message}`).join(", "),
                ].join("\n"),
            );

        });

    }
};


void (async () => {

    await renderAllLaws();

    run();

})();
