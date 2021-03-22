import { renderToString } from "react-dom/server";
import yargs from "yargs";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import { LawView } from "@appsrc/components/LawView";
import { Dispatchers, mapDispatchToProps } from "@appsrc/containers/LawtextAppPageContainer";
import * as states from "@appsrc/states";
import store from "@appsrc/store";
import { getLawXml, TextFetcher } from "@coresrc/data/lawlist";
import { promisify } from "util";
import fs from "fs";
import path from "path";


const textFetcher: TextFetcher = async (textPath: string) => {
    try {
        const text = await promisify(fs.readFile)(textPath, { encoding: "utf-8" });
        return text;
    } catch (e) {
        console.log(e);
        return null;
    }
};


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const makeDummyProps = (lawtextAppPageState: Partial<states.LawtextAppPageState> = {}) => {
    const props: states.LawtextAppPageState & Dispatchers = Object.assign(
        {},

        {
            law: null,
            loadingLaw: false,
            loadingLawMessage: "",
            lawSearchKey: null,
            lawSearchedKey: null,
            analysis: null,
            hasError: false,
            errors: [],
        },
        lawtextAppPageState,

        mapDispatchToProps(store.dispatch),

    );

    return props as states.LawtextAppPageState & Dispatchers & states.RouteState;

};

const dataPath = path.join(__dirname, "../../core/data");

const render = async (lawNum: string) => {

    const origXML = await getLawXml(dataPath, lawNum, textFetcher);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const origEL = util.xmlToJson(origXML!);
    analyze(origEL);

    const lawView = new LawView(makeDummyProps({ law: origEL as std.Law }));

    const renderedElement = lawView.render();

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
