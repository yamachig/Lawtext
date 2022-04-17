import { renderToString } from "react-dom/server";
import yargs from "yargs";
import { analyze } from "lawtext/dist/src/analyzer";
import * as std from "lawtext/dist/src/law/std";
import { xmlToJson } from "lawtext/dist/src/node/el";
import { LawView } from "@appsrc/components/LawView";
import path from "path";
import { BaseLawtextAppPageState, OrigSetLawtextAppPageState } from "../src/components/LawtextAppPageState";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";

import dotenv from "dotenv";
dotenv.config();

const DATA_PATH = process.env["DATA_PATH"];
if (!DATA_PATH) throw new Error("Environment variable DATA_PATH not set");

const dataPath = path.join(DATA_PATH);
const loader = new FSStoredLoader(dataPath);

const render = async (lawNum: string) => {

    const lawInfo = await loader.getLawInfoByLawNum(lawNum);
    if (lawInfo === null) throw Error("LawInfo not found");
    const { xml: origXML } = await loader.loadLawXMLStructByInfo(lawInfo);
    if (origXML === null) throw Error("XML not found");

    const origEL = xmlToJson(origXML);
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
    const renderedElement = LawView({
        origState: currentState,
        setState,
        origSetState,
        navigate: (() => { /* */ }),
        lawSearchKey: currentState.navigatedLawSearchKey,
    }) as JSX.Element;

    void renderToString(renderedElement);
};

process.on("unhandledRejection", (listener) => {
    throw listener;
});

void yargs
    .usage("$0 <mode> [args]")
    .command(

        "render [lawnum]",

        "render law",

        (_yargs => _yargs
            .positional("lawnum", {
                type: "string",
                default: "昭和二十五年法律第百三十一号",
            })
        ),

        _argv => {
            render(_argv.lawnum);
        },

    )
    .demandCommand()
    .help()
    .argv;
