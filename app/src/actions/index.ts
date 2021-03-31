import $ from "jquery";
import { LawtextAppPageState, SetLawtextAppPageState } from "../components/LawtextAppPageState";
import * as std from "@coresrc/std_law";
import * as util from "@coresrc/util";
import * as lawdata from "./lawdata";
import * as renderer from "@coresrc/renderer";
import render_lawtext from "@coresrc/renderers/lawtext";
import { saveAs } from "file-saver";

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

    let lawDataResult: lawdata.LawDataResult;

    if (/^(?:<\?xml|<Law)/.test(text.trim())) {
        setState({ loadingLawMessage: "法令XMLをパースしています..." });
        lawDataResult = lawdata.toLawData({
            source: "file_xml",
            xml: text,
        });
    } else {
        setState({ loadingLawMessage: "Lawtextをパースしています..." });
        lawDataResult = lawdata.toLawData({
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

export const ErrorModalID = "LawtextAppPage.ErrorModal";
const showErrorModal = (title: string, bodyEl: string) => {
    const modalEl = document.getElementById(ErrorModalID);
    if (!modalEl) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modal = $(modalEl) as JQuery<HTMLElement> & { modal: (method: string) => any };
    modal.find(".modal-title").html(title);
    modal.find(".modal-body").html(bodyEl);
    modal.modal("show");
};

export const invokeError =
    (title: string, bodyEl: string): void =>
        showErrorModal(title, bodyEl);

const displayLawDataResult = async (
    lawDataResult: lawdata.LawDataResult,
    setState: SetLawtextAppPageState,
): Promise<void> => {

    if (lawDataResult.ok) {


        const lawBody = lawDataResult.lawData.el.children.find(el => el.tag === "LawBody") as std.LawBody | undefined;
        const lawTitle = lawBody && lawBody.children.find(el => el.tag === "LawTitle") as std.LawTitle | undefined;
        document.title = lawTitle ? `${lawTitle.text} | Lawtext` : "Lawtext";

        setState({ loadingLawMessage: "レンダリングしています..." });
        console.log("loadLawText: Setting Law into State");
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

        invokeError(
            "法令の読み込み時にエラーが発生しました",
            (pre[0]).outerHTML,
        );

    }

};

export const refreshDisplayLaw = async (
    origState: LawtextAppPageState,
    setState: SetLawtextAppPageState,
): Promise<void> => {
    console.log(`displayLaw(${origState.lawSearchKey})`);
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
    console.log("displayLaw: Searching Law");
    await util.wait(30);

    const lawDataResult = await lawdata.loadLawByKey(origState.lawSearchKey);
    await displayLawDataResult(lawDataResult, setState);

    setState({ loadingLaw: false, loadingLawMessage: "" });
};


interface SelectionRange {
    start: {
        container_tag: string;
        container_id: string | null;
        item_tag: string;
        item_id: string | null;
    };
    end: {
        container_tag: string;
        container_id: string | null;
        item_tag: string;
        item_id: string | null;
    };
}


const tobeDownloadedRange = (): SelectionRange | null => {
    const getPos = (node: Node) => {
        if (!node.parentNode) return null;
        const el = $(node.parentNode as HTMLElement);

        const containerEl = el.data("container_info")
            ? el
            : el.parents("[data-container_info]").last();
        if (!containerEl) return null;
        const containerInfo = containerEl.data("container_info");

        const toplevelContainerEl = el.closest("[data-toplevel_container_info]");
        if (!toplevelContainerEl) return null;
        const toplevelContainerInfo = toplevelContainerEl.data("toplevel_container_info");

        return {
            container_tag: toplevelContainerInfo.tag,
            container_id: toplevelContainerInfo.id,
            item_tag: containerInfo && containerInfo.tag,
            item_id: containerInfo && containerInfo.id,
        };
    };

    const selection = window.getSelection();
    if (!selection) return null;
    const range = selection.getRangeAt(0);

    const sPos = getPos(range.startContainer);
    const ePos = getPos(range.endContainer);
    if (!sPos || !ePos) return null;

    return {
        start: sPos,
        end: ePos,
    };
};

export const containerInfoOf = (el: util.EL | string): {tag: string, id: string | number} => {
    if (typeof el === "string") {
        return { tag: "", id: "" };
    } else {
        return { tag: el.tag, id: el.id };
    }
};

const getLawRange = (origLaw: util.EL, range: SelectionRange) => {
    const sPos = range.start;
    const ePos = range.end;

    const law = new util.EL(
        origLaw.tag,
        origLaw.attr,
    );

    const origLawNum = origLaw.children.find((el) => typeof el !== "string" && el.tag === "LawNum") as util.EL;
    if (origLawNum) {
        law.append(origLawNum);
    }

    const origLawBody = origLaw.children.find((el) => typeof el !== "string" && el.tag === "LawBody") as util.EL;
    const lawBody = new util.EL(
        origLawBody.tag,
        origLawBody.attr,
    );
    law.append(lawBody);

    const origLawTitle = origLawBody.children.find((el) => typeof el !== "string" && el.tag === "LawTitle");
    if (origLawTitle) {
        lawBody.append(origLawTitle);
    }


    let inContainerRange = false;
    let inItemRange = false;

    const findEls = (el: util.EL | string, tag: string) => {
        if (!(el instanceof util.EL)) return [];
        if (el.tag === tag) return [el];
        let ret: util.EL[] = [];
        for (const child of el.children) {
            ret = ret.concat(findEls(child, tag));
        }
        return ret;
    };

    for (const toplevel of origLawBody.children) {
        const toplevelInfo = containerInfoOf(toplevel);
        if (typeof toplevel === "string") continue;
        if (
            !inContainerRange &&
            toplevelInfo.tag === sPos.container_tag &&
            toplevelInfo.id === sPos.container_id
        ) {
            inContainerRange = true;
        }

        const containerChildren: Array<util.EL | string> = [];

        // if (
        //     inContainerRange &&
        //     ePos.item_tag === "SupplProvisionLabel" &&
        //     toplevelInfo.tag === ePos.container_tag &&
        //     toplevelInfo.id === ePos.container_id
        // ) {
        //     inContainerRange = false;
        // }

        if (inContainerRange) {

            if (std.isMainProvision(toplevel) || std.isSupplProvision(toplevel)) {

                let items = findEls(toplevel, "Article");
                if (items.length === 0) items = findEls(toplevel, "Paragraph");

                for (const item of items) {
                    const itemInfo = containerInfoOf(item);

                    if (
                        !inItemRange &&
                        (
                            !sPos.item_tag ||
                            (
                                itemInfo.tag === sPos.item_tag &&
                                (
                                    !sPos.item_id ||
                                    itemInfo.id === sPos.item_id
                                )
                            )
                        )
                    ) {
                        inItemRange = true;
                    }

                    if (inItemRange) {
                        containerChildren.push(item);
                    }

                    if (
                        inItemRange &&
                        itemInfo.tag === ePos.item_tag &&
                        (
                            !ePos.item_id ||
                            itemInfo.id === ePos.item_id
                        )
                    ) {
                        inItemRange = false;
                    }
                }
            } else {
                containerChildren.push(...toplevel.children);
            }
        }

        if (containerChildren.length > 0) {
            const supplProvisionLabel = toplevel.children.find((el) => typeof el !== "string" && el.tag === "SupplProvisionLabel");
            if (supplProvisionLabel) containerChildren.unshift(supplProvisionLabel);
            lawBody.append(new util.EL(
                toplevel.tag,
                toplevel.attr,
                containerChildren,
            ));
        }

        if (
            inContainerRange &&
            toplevelInfo.tag === ePos.container_tag &&
            toplevelInfo.id === ePos.container_id
        ) {
            inContainerRange = false;
        }
    }

    return law;
};

const getLawName = (law: std.Law): string => {
    const lawNum = law.children.find((el) => el.tag === "LawNum") as std.LawNum;
    const lawBody = law.children.find((el) => el.tag === "LawBody") as std.LawBody;
    const lawTitle = lawBody && lawBody.children.find((el) => el.tag === "LawTitle") as std.LawTitle;

    let sLawNum = lawNum ? lawNum.text : "";
    const sLawTitle = lawTitle ? lawTitle.text : "";
    sLawNum = (sLawNum && sLawTitle) ? (`（${sLawNum}）`) : sLawNum;

    return sLawTitle + sLawNum;
};

export const downloadDocx = async (
    law: std.Law,
    downloadSelection: boolean,
): Promise<void> => {
    const range = downloadSelection ? tobeDownloadedRange() : null;
    if (range) {
        law = getLawRange(law, range) as std.Law;
    }

    const buffer = await renderer.renderDocxAsync(law);
    const blob = new Blob(
        [buffer],
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    );
    const lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.docx`);
};

export const downloadLawtext = async (
    law: std.Law,
): Promise<void> => {
    const sLawtext = render_lawtext(law);
    const blob = new Blob(
        [sLawtext],
        { type: "text/plain" },
    );
    const lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.law.txt`);
};

export const downloadXml = async (
    law: std.Law,
): Promise<void> => {
    const xml = renderer.renderXml(law);
    const blob = new Blob(
        [xml],
        { type: "application/xml" },
    );
    const lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.xml`);
};


const scrollToLawAnchor = (id: string) => {
    for (const el of Array.from(document.getElementsByClassName("law-anchor"))) {
        if ((el as HTMLElement).dataset.el_id === id) {
            // const rect = el.getBoundingClientRect();
            // const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            // const newScrollTop = scrollTop + rect.top;
            // document.body.scrollTop = newScrollTop;
            // document.documentElement.scrollTop = newScrollTop;
            const offset = $(el).offset();
            if (offset) $("html,body").animate({ scrollTop: offset.top }, "normal");
        }
    }
};

export const scrollLaw =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (id: string): void =>
        scrollToLawAnchor(id);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sampleSampleXml: string = require("./405AC0000000088_20180401_429AC0000000004.xml").default;

export const downloadSampleLawtext = async (
    setState: SetLawtextAppPageState,
): Promise<void> => {
    setState({ loadingLaw: true });
    await util.wait(30);
    const lawDataResult = lawdata.toLawData({
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

export const ensureFetch = async (): Promise<{isFile: boolean, canFetch: boolean}> => {
    const isFile = location.protocol === "file:";
    try {
        const res = await fetch("./index.html", { method: "HEAD" });
        return { isFile, canFetch: res.ok };
    } catch (e) {
        return { isFile, canFetch: false };
    }
};
