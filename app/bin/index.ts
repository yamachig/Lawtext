import chai from "chai";
import { it } from "mocha";
import { renderToString } from "react-dom/server";
import yargs from "yargs";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util"
import { LawView } from "@appsrc/components/LawView";
import { Dispatchers, mapDispatchToProps } from '../src/containers/LawtextAppPageContainer';
import * as states from '../src/states';
import store from '../src/store';
import { getLawList, getLawXml } from "../../core/test/prepare_test";



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

}


const render = async (lawNum: string) => {

    const origXML = await getLawXml(lawNum);

    const origEL = util.xmlToJson(origXML);
    analyze(origEL);

    const lawView = new LawView(makeDummyProps({ law: origEL as std.Law }));

    const renderedElement = lawView.render();

    const renderedString = renderToString(renderedElement);
}

process.on('unhandledRejection', (listener) => {
    throw listener;
});

const argv = yargs
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