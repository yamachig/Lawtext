import $ from "jquery";
import { SetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "@coresrc/util";
import { LawDataResult } from "@appsrc/lawdata/common";
import { getLawTitleWithNum } from "@appsrc/law_util";
import { showErrorModal } from "./showErrorModal";

export const displayLawDataResult = async (
    lawDataResult: LawDataResult,
    setState: SetLawtextAppPageState,
): Promise<void> => {

    if (lawDataResult.ok) {

        const lawTitle = getLawTitleWithNum(lawDataResult.lawData.el);
        document.title = lawTitle ? `${lawTitle} | Lawtext` : "Lawtext";

        setState({ loadingLawMessage: "レンダリングしています..." });
        console.log("displayLawDataResult: Setting Law into State");
        await util.wait(30);
        setState({
            law: lawDataResult.lawData,
        });

    } else {

        console.log(lawDataResult.error);
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

    }

};
