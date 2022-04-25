import React from "react";
import chai from "chai";
import { it } from "mocha";
import ReactDOMServer from "react-dom/server";
import { analyze } from "lawtext/dist/src/analyzer";
import * as std from "lawtext/dist/src/law/std";
import { xmlToEL } from "lawtext/dist/src/node/el/xmlToEL";
import { LawView } from "@appsrc/components/LawView";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";
import path from "path";
import { BaseLawtextAppPageState, OrigSetLawtextAppPageState } from "../src/components/LawtextAppPageState";

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
            const { xml: origXML } = await loader.loadLawXMLStructByInfo(lawInfo);
            if (origXML === null) throw Error("XML not found");

            const origEL = xmlToEL(origXML) as std.Law;
            const analysis = analyze(origEL);

            let currentState: BaseLawtextAppPageState = {
                law: {
                    source: "file_xml",
                    el: origEL as std.Law,
                    xml: origXML,
                    analysis,
                    pictURL: new Map(),
                    lawXMLStruct: null,
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
                    navigate={() => { /* */ }}
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
