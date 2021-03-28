import { renderToString } from "react-dom/server";
import yargs from "yargs";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import { LawView } from "@appsrc/components/LawView";
import path from "path";
import { LawtextAppPageState } from "./components/LawtextAppPageState";
import { FSStoredLoader } from "@coresrc/data/loaders/FSStoredLoader";

const dataPath = path.join(__dirname, "../../core/data");
const loader = new FSStoredLoader(dataPath);

const render = async (lawNum: string) => {

    const origXML = await loader.getLawXmlByLawNum(lawNum);

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
