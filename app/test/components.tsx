import React from "react";
import chai from "chai";
import { it } from "mocha";
import ReactDOMServer from "react-dom/server";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import { LawView } from "@appsrc/components/LawView";
import { FSStoredLoader } from "@coresrc/data/loaders/FSStoredLoader";
import path from "path";
import { BaseLawtextAppPageState, OrigSetLawtextAppPageState } from "./components/LawtextAppPageState";
import { createMemoryHistory } from "history";

import dotenv from "dotenv";
dotenv.config();

const DATA_PATH = process.env["DATA_PATH"];
if (!DATA_PATH) throw new Error("Environment variable DATA_PATH not set");

const dataPath = path.join(DATA_PATH);
const loader = new FSStoredLoader(dataPath);

const renderAllLaws = async () => {

    const pickedLawNum = "平成二十六年政令第三百九十四号";

    const { lawInfos } = await loader.loadLawInfosStruct();

    for (const { LawNum: lawNum, LawTitle: lawTitle } of lawInfos.filter(o => o.LawNum === pickedLawNum)) {

        it(`${lawTitle}（${lawNum}）`, async () => {

            const lawInfo = await loader.getLawInfoByLawNum(lawNum);
            if (lawInfo === null) throw Error("LawInfo not found");
            const origXML = await loader.loadLawXMLByInfo(lawInfo);
            if (origXML === null) throw Error("XML not found");

            const origEL = util.xmlToJson(origXML);
            const analysis = analyze(origEL);

            let currentState: BaseLawtextAppPageState = {
                law: {
                    source: "file_xml",
                    el: origEL as std.Law,
                    xml: origXML,
                    analysis,
                },
                loadingLaw: false,
                viewerMessages: {},
                hasError: false,
                errors: [],
                navigatedLawSearchKey: lawInfo.LawNum,
            };

            const origSetState: OrigSetLawtextAppPageState = newState => {
                currentState = typeof newState === "function" ? newState(currentState) : newState;
            };

            const setState = (newState: Partial<BaseLawtextAppPageState>) => {
                origSetState({ ...currentState, ...newState });
            };

            void ReactDOMServer.renderToStaticMarkup(
                <LawView
                    origState={currentState}
                    setState={setState}
                    origSetState={origSetState}
                    history={createMemoryHistory({ initialEntries: ["/"] })}
                    lawSearchKey={currentState.navigatedLawSearchKey}
                />,
            );

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
