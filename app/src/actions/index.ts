import { LawtextAppPageState, SetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "@coresrc/util";
import { toLawData } from "@appsrc/lawdata/common";
import { searchLawData } from "@appsrc/lawdata/searchLawData";
import { downloadLawtext } from "./download";
import { displayLawDataResult } from "./displayLawDataResult";

export const refreshDisplayLaw = async (
    origState: LawtextAppPageState,
    setState: SetLawtextAppPageState,
): Promise<void> => {
    console.log(`refreshDisplayLaw(${origState.lawSearchKey})`);
    if (origState.lawSearchKey === origState.lawSearchedKey) return;
    if (!origState.lawSearchKey) {
        setState({ law: null, lawSearchedKey: origState.lawSearchKey });
        return;
    }

    setState({
        loadingLaw: true,
        lawSearchedKey: origState.lawSearchKey,
        loadingLawMessage: "法令を検索しています...",
    });
    console.log("refreshDisplayLaw: Searching Law");
    await util.wait(30);

    const lawDataResult = await searchLawData(origState.lawSearchKey);
    await displayLawDataResult(lawDataResult, setState);

    setState({ loadingLaw: false, loadingLawMessage: "" });
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sampleSampleXml: string = require("./405AC0000000088_20180401_429AC0000000004.xml").default;

export const downloadSampleLawtext = async (
    setState: SetLawtextAppPageState,
): Promise<void> => {
    setState({ loadingLaw: true });
    await util.wait(30);
    const lawDataResult = toLawData({
        source: "file_xml",
        xml: sampleSampleXml,
    });
    await displayLawDataResult(
        lawDataResult,
        setState,
    );
    if (lawDataResult.ok) {
        await downloadLawtext(lawDataResult.lawData.el);
    }
    setState({ loadingLaw: false });
};
