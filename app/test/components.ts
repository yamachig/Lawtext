import chai from "chai";
import { it } from "mocha";
import { renderToString } from "react-dom/server";
import { analyze } from "@coresrc/analyzer";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util"
import { LawView } from "../src/components/LawView";
import { Dispatchers, mapDispatchToProps } from '../src/containers/LawtextAppPageContainer';
import * as states from '../src/states';
import {getDataPath} from '../src/states/lawdata';
import store from '../src/store';
import { getLawList, getLawXml, TextFetcher } from "@coresrc/db/lawlist";
import {promisify} from "util";
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

const dataPath = path.join(__dirname, "../../core/data");

const renderAllLaws = async () => {

    const [list, listByLawnum] = await getLawList(dataPath, textFetcher);

    for (const { LawNum: lawNum, LawTitle: lawTitle } of list) {

        it(`${lawTitle}（${lawNum}）`, async () => {

            const origXML = await getLawXml(dataPath, lawNum, textFetcher);

            const origEL = util.xmlToJson(origXML!);
            analyze(origEL);

            const lawView = new LawView(makeDummyProps({ law: origEL as std.Law }));

            const renderedElement = lawView.render();

            const renderedString = renderToString(renderedElement);

            chai.assert(
                !lawView.props.hasError,
                [
                    `${lawTitle}（${lawNum}）`,
                    lawView.props.errors.map(e => `[${e.name}]${e.message}`).join(", "),
                ].join("\n"),
            );

        });

    }
}


(async () => {

    await renderAllLaws();

    run();

})();