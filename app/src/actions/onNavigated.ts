import { SetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "@coresrc/util";
import { LawDataResult, Timing, toLawData } from "@appsrc/lawdata/common";
import { navigateLawData } from "@appsrc/lawdata/navigateLawData";
import { downloadLawtext } from "./download";
import $ from "jquery";
import { getLawTitleWithNum } from "@appsrc/law_util";
import { showErrorModal } from "./showErrorModal";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sampleXml: string = require("./405AC0000000088_20180401_429AC0000000004.xml").default;

export const onNavigated = async (
    lawSearchKey: string,
    setState: SetLawtextAppPageState,
): Promise<void> => {
    console.log(`onNavigated(${lawSearchKey})`);

    const onMessage = (message: string) => setState({ loadingLawMessage: message });

    if (!lawSearchKey) {
        console.log("onNavigated: detected the top page.");
        setState({
            navigatedLawSearchKey: lawSearchKey,
            law: null,
            loadingLaw: false,
            loadingLawMessage: "",
        });
        return;
    }

    setState({
        navigatedLawSearchKey: lawSearchKey,
        law: null,
        loadingLaw: true,
        loadingLawMessage: "法令を読み込んでいます...",
    });

    const toDownloadSample = (lawSearchKey.startsWith("(sample)"));
    let lawDataResult: LawDataResult;

    const timing = new Timing();

    if (toDownloadSample) {
        onMessage("サンプル法令を読み込んでいます...");
        console.log("onNavigated: loading the sample low...");
        lawDataResult = await toLawData({
            source: "file_xml",
            xml: sampleXml,
        }, onMessage, timing);
    } else {
        onMessage("法令を検索しています...");
        console.log("onNavigated: searching law...");
        await util.wait(30);
        lawDataResult = await navigateLawData(lawSearchKey, onMessage, timing);
    }

    if (!lawDataResult.ok) {
        console.error("onNavigated: error during loading the law...");
        console.error(lawDataResult.error);
        const errStr = lawDataResult.error.toString();
        const pre = $("<pre>")
            .css({ "white-space": "pre-wrap" })
            .css({ "line-height": "1.2em" })
            .css({ "padding": "1em 0" })
            .html(errStr);

        showErrorModal(
            "法令の読み込み時にエラーが発生しました",
            (pre[0]).outerHTML,
        );

        setState({
            law: null,
            loadingLaw: false,
            loadingLawMessage: "",
        });
        return;
    }

    if (toDownloadSample && lawDataResult.ok) {
        onMessage("サンプル法令を保存しています...");
        console.log("onNavigated: saving the sample low...");
        await downloadLawtext(lawDataResult.lawData.el);
    }

    const lawTitle = getLawTitleWithNum(lawDataResult.lawData.el);
    document.title = lawTitle ? `${lawTitle} | Lawtext` : "Lawtext";

    onMessage("レンダリングしています...");
    console.log("onNavigated: setting law into state...");
    await util.wait(30);
    const start = new Date();
    setState({
        law: lawDataResult.lawData,
        loadingLaw: false,
        loadingLawMessage: "",
    });
    timing.render = (new Date()).getTime() - start.getTime();
    console.log("onNavigated: completed.");
    console.log(timing.toString());
};

