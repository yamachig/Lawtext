import { SetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as util from "@coresrc/util";
import { LawDataResult, toLawData } from "@appsrc/lawdata/common";
import { displayLawDataResult } from "./displayLawDataResult";

const readFileAsText = (file: Blob): Promise<string> => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(reader.error);
        };
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsText(file);
    });
};


export const OpenFileInputName = "LawtextAppPage.OpenFileInput";
export const openFile = (): void => {
    const els = document.getElementsByName(OpenFileInputName);
    if (els) {
        els[0].click();
    }
};

export const openFileInputChange = async (
    setState: SetLawtextAppPageState,
    event: React.ChangeEvent<HTMLInputElement>,
): Promise<void> => {
    const openFileInput = event.target;
    const file = openFileInput.files ? openFileInput.files[0] : null;
    if (!file) return;

    setState({ loadingLaw: true, loadingLawMessage: "ファイルを読み込んでいます..." });
    console.log("openFileInputChange: Loading file");
    await util.wait(30);

    const text = await readFileAsText(file);
    openFileInput.value = "";

    let lawDataResult: LawDataResult;

    if (/^(?:<\?xml|<Law)/.test(text.trim())) {
        setState({ loadingLawMessage: "法令XMLをパースしています..." });
        lawDataResult = toLawData({
            source: "file_xml",
            xml: text,
        });
    } else {
        setState({ loadingLawMessage: "Lawtextをパースしています..." });
        lawDataResult = toLawData({
            source: "file_lawtext",
            lawtext: text,
        });
    }

    await displayLawDataResult(
        lawDataResult,
        setState,
    );

    if (lawDataResult.ok) {
        setState({ lawSearchKey: "", loadingLaw: false, loadingLawMessage: "" });
    } else {
        setState({ loadingLaw: false, loadingLawMessage: "" });
    }

};
