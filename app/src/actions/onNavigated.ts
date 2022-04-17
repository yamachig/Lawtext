import { OrigSetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "lawtext/dist/src/util";
import { LawDataResult, Timing, toLawData } from "lawtext/dist/src/data/lawdata";
import { navigateLawData } from "@appsrc/lawdata/navigateLawData";
import { downloadLawtext } from "./download";
import { getLawTitleWithNum } from "@appsrc/law_util";
import { showErrorModal } from "./showErrorModal";
import { LawDataProps } from "@appsrc/lawdata/common";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sampleXml: string = require("./405AC0000000088_20180401_429AC0000000004.xml").default;

export const onNavigated = async (
    lawSearchKey: string,
    origSetState: OrigSetLawtextAppPageState,
): Promise<void> => {
    console.log(`onNavigated(${lawSearchKey})`);

    const onMessage = (message: string) => {
        origSetState(s => ({
            ...s,
            viewerMessages: {
                ...s.viewerMessages,
                loadingLaw: message,
            },
        }));
        console.log(message);
    };

    if (!lawSearchKey) {
        console.log("onNavigated: detected the top page.");
        origSetState(s => {
            const { law: oldLaw } = s;
            if (oldLaw && ("xml" in oldLaw)) {
                oldLaw.lawXMLStruct?.clean();
            }
            return {
                ...s,
                navigatedLawSearchKey: lawSearchKey,
                law: null,
                loadingLaw: false,
                viewerMessages: util.omit(s.viewerMessages, "loadingLaw"),
            };
        });
        return;
    }

    origSetState(s => {
        const { law: oldLaw } = s;
        if (oldLaw && ("xml" in oldLaw)) {
            oldLaw.lawXMLStruct?.clean();
        }
        return {
            ...s,
            navigatedLawSearchKey: lawSearchKey,
            law: null,
            loadingLaw: true,
            viewerMessages: {
                ...s.viewerMessages,
                loadingLaw: "法令を読み込んでいます...",
            },
        };
    });

    const toDownloadSample = (lawSearchKey.startsWith("(sample)"));
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
        await util.wait(30);
        lawDataResult = await navigateLawData(lawSearchKey, onMessage, timing);
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

        origSetState(s => ({
            ...s,
            law: null,
            loadingLaw: false,
            viewerMessages: util.omit(s.viewerMessages, "loadingLaw"),
        }));

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

    origSetState(s => {
        const { law: oldLaw } = s;
        if (oldLaw && ("xml" in oldLaw)) {
            oldLaw.lawXMLStruct?.clean();
        }
        return {
            ...s,
            law: lawData,
            loadingLaw: false,
            viewerMessages: util.omit(s.viewerMessages, "loadingLaw"),
        };
    });

    timing.updateComponents = (new Date()).getTime() - start.getTime();

    console.log(timing.toString());
};

