import type { OrigSetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "lawtext/dist/src/util";
import type { LawDataResult } from "lawtext/dist/src/data/lawdata";
import { Timing, toLawData } from "lawtext/dist/src/data/lawdata";
import { navigateLawData } from "@appsrc/lawdata/navigateLawData";
import { downloadLawtext } from "./download";
import { getLawTitleWithNum } from "@appsrc/law_util";
import { showErrorModal } from "./showErrorModal";
import type { LawDataProps } from "@appsrc/lawdata/common";
import getOnMessage from "./getOnMessage";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sampleXml: string = require("./405AC0000000088_20240401_504AC0100000052.xml").default;

export const onNavigated = async (
    pathStr: string,
    prevPathStr: string,
    origSetState: OrigSetLawtextAppPageState,
): Promise<void> => {
    console.log(`onNavigated(${pathStr})`);

    {
        const firstPart = pathStr.split("/", 1)[0];
        const prevFirstPart = prevPathStr.split("/", 1)[0];
        if (firstPart === prevFirstPart) {
            console.log("onNavigated: the first step in the path did not change.");
            origSetState(s => {
                return {
                    ...s,
                    navigatedPath: pathStr,
                };
            });
            return;
        }
    }

    const { onMessage, setStateAndMessage } = getOnMessage({ key: "loadingLaw", origSetState });

    if (!pathStr) {
        console.log("onNavigated: detected the top page.");
        setStateAndMessage(s => {
            // const { law: oldLaw } = s;
            // if (oldLaw && ("xml" in oldLaw)) {
            //     oldLaw.lawXMLStruct?.clean();
            // }
            return {
                ...s,
                navigatedPath: pathStr,
                law: null,
                loadingLaw: false,
            };
        }, null);
        return;
    }

    setStateAndMessage(s => {
        // const { law: oldLaw } = s;
        // if (oldLaw && ("xml" in oldLaw)) {
        //     oldLaw.lawXMLStruct?.clean();
        // }
        return {
            ...s,
            navigatedPath: pathStr,
            law: null,
            loadingLaw: true,
        };
    }, "法令を読み込んでいます...");

    const toDownloadSample = (pathStr.startsWith("(sample)"));
    let lawDataResult: LawDataResult<LawDataProps>;

    const timing = new Timing();

    if (toDownloadSample) {
        onMessage("サンプル法令を読み込んでいます...");
        // console.log("onNavigated: loading the sample low...");
        lawDataResult = await toLawData({
            source: "file_xml",
            xml: sampleXml,
            lawXMLStruct: null,
        }, onMessage, timing);
    } else {
        onMessage("法令を検索しています...");
        // console.log("onNavigated: searching law...");
        document.title = "Lawtext";
        await util.wait(30);
        const navigateLawDataResult = await navigateLawData(pathStr, onMessage, timing);
        if ("redirectPath" in navigateLawDataResult) {
            const redirectPath = navigateLawDataResult.redirectPath;
            console.log(`onNavigated: redirecting to the new path: "${redirectPath}"`);
            setStateAndMessage(s => ({
                ...s,
                law: null,
                loadingLaw: false,
            }), null);
            location.hash = "/" + redirectPath;
            return;
        } else {
            lawDataResult = navigateLawDataResult;
        }
    }

    if (!lawDataResult.ok) {
        console.error("onNavigated: error during loading the law...");
        console.error(lawDataResult.error);
        const errStr = lawDataResult.error.toString();
        const pre = document.createElement("pre");
        pre.textContent = errStr;
        pre.style.whiteSpace = "pre-wrap";
        pre.style.lineHeight = "1.2em";
        pre.style.padding = "1em 0";

        showErrorModal(
            "法令の読み込み時にエラーが発生しました",
            pre.outerHTML,
        );

        setStateAndMessage(s => ({
            ...s,
            law: null,
            loadingLaw: false,
        }), null);

        return;
    }

    const lawData = lawDataResult.lawData;

    if (toDownloadSample) {
        onMessage("サンプル法令を保存しています...");
        // console.log("onNavigated: saving the sample low...");
        await downloadLawtext(lawData.el);
    }

    const lawTitle = getLawTitleWithNum(lawData.el);
    document.title = lawTitle ? `${lawTitle} | Lawtext` : "Lawtext";

    onMessage("コンポーネントを更新しています...");
    // console.log("onNavigated: updating components...");
    await util.wait(30);
    const start = new Date();

    setStateAndMessage(s => {
        // const { law: oldLaw } = s;
        // if (oldLaw && ("xml" in oldLaw)) {
        //     oldLaw.lawXMLStruct?.clean();
        // }
        return {
            ...s,
            law: lawData,
            loadingLaw: false,
            viewerMessages: util.omit(s.viewerMessages, "loadingLaw"),
        };
    }, null);

    timing.updateComponents = (new Date()).getTime() - start.getTime();

    console.log(timing.toString());
};

