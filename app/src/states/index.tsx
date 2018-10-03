import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router'
import { History } from 'history';
import { reducerWithInitialState } from 'typescript-fsa-reducers/dist';
import { isString } from "util";
import * as $ from "jquery"
import { LawtextAppPageActions } from '../actions';
import { openFile as origOpenFile, showErrorModal, tobeDownloadedRange, scrollToLawAnchor } from '../components/LawtextAppPage'
import * as std from "../../../core/src/std_law"
import * as util from "../../../core/src/util"
import { parse } from "../../../core/src/parser_wrapper";
import * as analyzer from "../../../core/src/analyzer";
import * as renderer from "../../../core/src/renderer";
import render_lawtext from "../../../core/src/renderers/lawtext";
import { store } from '../store';
import * as lawdata from "./lawdata";
import { saveAs } from "file-saver";

export type RouteState = RouteComponentProps<{ lawSearchKey: string | undefined }>;

export interface LawtextAppPageState {
    law: std.Law | null;
    loadingLaw: boolean;
    loadingLawMessage: string;
    lawSearchKey: string | null;
    lawSearchedKey: string | null;
    analysis: analyzer.Analysis | null;
    hasError: boolean;
    errors: Error[];
}

const initialState: LawtextAppPageState = {
    law: null,
    loadingLaw: false,
    loadingLawMessage: "",
    lawSearchKey: null,
    lawSearchedKey: null,
    analysis: null,
    hasError: false,
    errors: [],
};

export const LawtextAppPageReducer = reducerWithInitialState(initialState);

export const openFile =
    (dispatch: Dispatch<Action<any>>) =>
        origOpenFile();

interface FileReaderProgressEvent extends ProgressEvent {
    readonly target: FileReader | null;
}

function readFileAsText(file): Promise<string> {
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
}

export async function openFileInputChange(
    dispatch: Dispatch<Action<any>>,
    event: React.ChangeEvent<HTMLInputElement>,
) {
    const openFileInput = event.target;
    const file = openFileInput.files ? openFileInput.files[0] : null;
    if (!file) return;

    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: true, loadingLawMessage: "ファイルを読み込んでいます..." }));
    console.log("openFileInputChange: Loading file");
    await util.wait(30);

    const text = await readFileAsText(file);
    openFileInput.value = "";
    await loadLawText(dispatch, text, true);
    dispatch(LawtextAppPageActions.modifyState({ lawSearchKey: null, loadingLaw: false, loadingLawMessage: "" }));
}

LawtextAppPageReducer.case(LawtextAppPageActions.modifyState, (state, newState) => {
    return Object.assign({}, state, newState);
});

export const invokeError =
    (dispatch: Dispatch<Action<any>>, title: string, bodyEl: string) =>
        showErrorModal(title, bodyEl);

export async function loadLawText(
    dispatch: Dispatch<Action<any>>,
    text: string,
    analyzeXml: boolean,
) {
    let law: std.Law | null = null;
    let analysis: analyzer.Analysis | null = null;
    try {
        if (/^(?:<\?xml|<Law)/.test(text.trim())) {
            dispatch(LawtextAppPageActions.modifyState({ loadingLawMessage: "法令XMLをパースしています..." }));
            console.log("loadLawText: Parse as XML");
            await util.wait(30);
            law = util.xml_to_json(text) as std.Law;
            if (analyzeXml) {
                analyzer.stdxml_to_ext(law);
            }
            analysis = analyzer.analyze(law);
        } else {
            dispatch(LawtextAppPageActions.modifyState({ loadingLawMessage: "Lawtextをパースしています..." }));
            console.log("loadLawText: Parse as Lawtext");
            await util.wait(30);
            law = parse(text, { startRule: "start" }) as std.Law;
            analysis = analyzer.analyze(law);

        }
    } catch (err) {
        console.log(err);
        let err_str = err.toString();
        let pre = $("<pre>")
            .css({ "white-space": "pre-wrap" })
            .css({ "line-height": "1.2em" })
            .css({ "padding": "1em 0" })
            .html(err_str);
        invokeError(
            dispatch,
            "読み込んだ法令データにエラーがあります",
            (pre[0] as HTMLElement).outerHTML,
        );
        law = null;
    }
    const newState: Partial<LawtextAppPageState> = {};
    if (law) {
        newState.law = law;
        newState.analysis = analysis;
        const lawBody = law.children.find(el => el.tag === "LawBody") as std.LawBody | undefined;
        const lawTitle = lawBody && lawBody.children.find(el => el.tag === "LawTitle") as std.LawTitle | undefined;
        document.title = lawTitle ? `${lawTitle.text} | Lawtext` : "Lawtext";
    } else {
        document.title = "Lawtext";
    }
    dispatch(LawtextAppPageActions.modifyState({ loadingLawMessage: "レンダリングしています..." }));
    console.log("loadLawText: Setting Law into State");
    await util.wait(30);
    dispatch(LawtextAppPageActions.modifyState(newState));
}

export async function searchLaw(
    dispatch: Dispatch<Action<any>>,
    lawSearchKey: string,
) {
    console.log(`searchLaw(${lawSearchKey})`);
    const state = store.getState().lawtextAppPage;
    if (lawSearchKey === state.lawSearchedKey) return;
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: true, lawSearchedKey: lawSearchKey, loadingLawMessage: "法令を検索しています..." }));
    console.log("searchLaw: Searching Law");
    await util.wait(30);
    try {
        let text = await lawdata.loadLaw(lawSearchKey);
        await loadLawText(dispatch, text, true);
    } catch (err) {
        console.log(err);
        invokeError(
            dispatch,
            err[0] || "エラー",
            err[1] || err.toString(),
        );
    }
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: false, loadingLawMessage: "" }));
}

export interface SelectionRange {
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
};

function getLawRange(origLaw: util.EL, range: SelectionRange) {
    const sPos = range.start;
    const ePos = range.end;

    const law = new util.EL(
        origLaw.tag,
        origLaw.attr,
    );

    const origLawNum = origLaw.children.find((el) => !isString(el) && el.tag === "LawNum") as util.EL;
    if (origLawNum) {
        law.append(origLawNum);
    }

    const origLawBody = origLaw.children.find((el) => !isString(el) && el.tag === "LawBody") as util.EL;
    const lawBody = new util.EL(
        origLawBody.tag,
        origLawBody.attr,
    );
    law.append(lawBody);

    const origLawTitle = origLawBody.children.find((el) => !isString(el) && el.tag === "LawTitle");
    if (origLawTitle) {
        lawBody.append(origLawTitle);
    }


    let inContainerRange = false;
    let inItemRange = false;

    const findEls = (el: util.EL | string, tag: string) => {
        if (!(el instanceof util.EL)) return [];
        if (el.tag === tag) return [el];
        let ret: util.EL[] = [];
        for (let child of el.children) {
            ret = ret.concat(findEls(child, tag));
        }
        return ret;
    }

    for (let toplevel of origLawBody.children) {
        if (isString(toplevel)) continue;
        if (
            !inContainerRange &&
            toplevel.tag === sPos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === sPos.container_id
            )
        ) {
            inContainerRange = true;
        }

        let containerChildren: (util.EL | string)[] = [];

        if (
            inContainerRange &&
            ePos.item_tag === "SupplProvisionLabel" &&
            toplevel.tag === ePos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === ePos.container_id
            )
        ) {
            inContainerRange = false;
        }

        if (inContainerRange) {

            let items = findEls(toplevel, "Article");
            if (items.length === 0) items = findEls(toplevel, "Paragraph");

            for (let item of items) {

                if (
                    !inItemRange &&
                    (
                        sPos.item_tag === "SupplProvisionLabel" ||
                        (
                            item.tag === sPos.item_tag &&
                            (
                                !sPos.item_id ||
                                item.attr.Num === sPos.item_id
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
                    item.tag === ePos.item_tag &&
                    (
                        !ePos.item_id ||
                        item.attr.Num === ePos.item_id
                    )
                ) {
                    inItemRange = false;
                }
            }
        }

        if (containerChildren.length > 0) {
            const supplProvisionLabel = toplevel.children.find((el) => !isString(el) && el.tag === "SupplProvisionLabel");
            if (supplProvisionLabel) containerChildren.unshift(supplProvisionLabel);
            lawBody.append(new util.EL(
                toplevel.tag,
                toplevel.attr,
                containerChildren,
            ));
        }

        if (
            inContainerRange &&
            toplevel.tag === ePos.container_tag &&
            (
                toplevel.tag !== "SupplProvision" ||
                (toplevel.attr.AmendLawNum || null) === ePos.container_id
            )
        ) {
            inContainerRange = false;
        }
    }

    return law;
}

export function getLawName(law: std.Law): string {
    let lawNum = law.children.find((el) => el.tag === "LawNum") as std.LawNum;
    let lawBody = law.children.find((el) => el.tag === "LawBody") as std.LawBody;
    let lawTitle = lawBody && lawBody.children.find((el) => el.tag === "LawTitle") as std.LawTitle;

    let sLawNum = lawNum ? lawNum.text : "";
    let sLawTitle = lawTitle ? lawTitle.text : "";
    sLawNum = (sLawNum && sLawTitle) ? (`（${sLawNum}）`) : sLawNum;

    return sLawTitle + sLawNum;
}

export async function downloadDocx(
    dispatch: Dispatch<Action<any>>,
    downloadSelection: boolean,
) {
    let law = store.getState().lawtextAppPage.law;
    if (law === null) return;

    const range = downloadSelection ? tobeDownloadedRange() : null;
    if (range) {
        law = getLawRange(law, range) as std.Law;
    }

    const buffer = await renderer.render_docx_async(law);
    let blob = new Blob(
        [buffer],
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    );
    let lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.docx`);
}

export async function downloadLawtext(
    dispatch: Dispatch<Action<any>>,
) {
    let law = store.getState().lawtextAppPage.law;
    if (law === null) return;

    const sLawtext = render_lawtext(law);
    let blob = new Blob(
        [sLawtext],
        { type: "text/plain" },
    );
    let lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.law.txt`);
}

export async function downloadXml(
    dispatch: Dispatch<Action<any>>,
) {
    let law = store.getState().lawtextAppPage.law;
    if (law === null) return;

    const xml = renderer.render_xml(law);
    let blob = new Blob(
        [xml],
        { type: "application/xml" },
    );
    let lawName = getLawName(law) || "lawtext_output";
    saveAs(blob, `${lawName}.xml`);
}

export const scrollLaw =
    (dispatch: Dispatch<Action<any>>, id: string) =>
        scrollToLawAnchor(id);

const sampleSampleXml: string = require("./405AC0000000088_20180401_429AC0000000004.xml");

export async function downloadSampleLawtext(
    dispatch: Dispatch<Action<any>>,
) {
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: true }));
    await util.wait(30);
    await loadLawText(dispatch, sampleSampleXml, true);
    await downloadLawtext(dispatch);
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: false }));
}

