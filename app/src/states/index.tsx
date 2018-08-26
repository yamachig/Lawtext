import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router'
import { History } from 'history';
import { reducerWithInitialState } from 'typescript-fsa-reducers/dist';
import { isString } from "util";
import { LawtextAppPageActions } from '../actions';
import { openFile, showErrorModal, tobeDownloadedRange, scrollToLawAnchor } from '../components/LawtextAppPage'
import * as std from "../../../js/src/std_law"
import * as util from "../../../js/src/util"
import { parse } from "../../../js/src/parser_wrapper";
import * as analyzer from "../../../js/src/analyzer";
import * as renderer from "../../../js/src/renderer";
import render_lawtext from "../../../js/src/renderers/lawtext";
import { store } from '../store';
import * as lawdata from "./lawdata";
import { saveAs } from "file-saver";

export type RouteState = RouteComponentProps<{ lawSearchKey: string | undefined }>;

export interface LawtextAppPageState {
    law: std.Law | null;
    loadingLaw: boolean;
    lawSearchKey: string | null;
    lawSearchedKey: string | null;
    analysis: any | null;
}

const initialState: LawtextAppPageState = {
    law: null,
    loadingLaw: false,
    lawSearchKey: null,
    lawSearchedKey: null,
    analysis: null,
};

export const LawtextAppPageReducer = reducerWithInitialState(initialState);

LawtextAppPageReducer.case(LawtextAppPageActions.openFile, (state) => {
    openFile();
    return Object.assign({}, state, {});
});

interface FileReaderProgressEvent extends ProgressEvent {
    readonly target: FileReader | null;
}

export function openFileInputChange(
    dispatch: Dispatch<Action<any>>,
    event: React.ChangeEvent<HTMLInputElement>,
) {
    const openFileInput = event.target;
    const file = openFileInput.files ? openFileInput.files[0] : null;
    if (!file) return;

    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: true }));

    const reader = new FileReader();
    reader.onload = (e: FileReaderProgressEvent) => {
        openFileInput.value = "";
        const text = e.target ? (e.target.result as string) : "";
        dispatch(LawtextAppPageActions.loadLawText({ text: text, analyzeXml: true }));
        dispatch(LawtextAppPageActions.modifyState({ lawSearchKey: null, loadingLaw: false }));
    };
    reader.readAsText(file);
}

LawtextAppPageReducer.case(LawtextAppPageActions.modifyState, (state, newState) => {
    return Object.assign({}, state, newState);
});

LawtextAppPageReducer.case(LawtextAppPageActions.invokeError, (state, { title, bodyEl }) => {
    showErrorModal(title, bodyEl)
    return Object.assign({}, state, {});
});

LawtextAppPageReducer.case(LawtextAppPageActions.loadLawText, (state, { text, analyzeXml }) => {
    let law: std.Law | null = null;
    if (/^(?:<\?xml|<Law)/.test(text.trim())) {
        law = util.xml_to_json(text) as std.Law;
        if (analyzeXml) {
            analyzer.stdxml_to_ext(law);
        }
    } else {
        try {
            law = parse(text, { startRule: "start" }) as std.Law;
        } catch (err) {
            let err_str = err.toString();
            let pre = $("<pre>")
                .css({ "white-space": "pre-wrap" })
                .css({ "line-height": "1.2em" })
                .css({ "padding": "1em 0" })
                .html(err_str);
            store.dispatch(LawtextAppPageActions.invokeError({
                title: "読み込んだLawtextにエラーがあります",
                bodyEl: (pre[0] as HTMLElement).outerHTML,
            }));
            law = null;
        }

    }
    const newState: Partial<LawtextAppPageState> = {};
    if (law) {
        newState.law = law;
    }
    return Object.assign({}, state, newState);
});

export async function searchLaw(
    dispatch: Dispatch<Action<any>>,
    lawSearchKey: string,
    history?: History,
) {
    console.log(`searchLaw(${lawSearchKey})`);
    if (history) {
        history.push(`/${lawSearchKey}`);
    }
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: true, lawSearchedKey: lawSearchKey }));
    await util.wait(300);
    try {
        let text = await lawdata.loadLaw(lawSearchKey);
        dispatch(LawtextAppPageActions.loadLawText({ text: text, analyzeXml: true }));
    } catch (err) {
        store.dispatch(LawtextAppPageActions.invokeError({
            title: err[0],
            bodyEl: err[1],
        }));
    }
    dispatch(LawtextAppPageActions.modifyState({ loadingLaw: false }));
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

LawtextAppPageReducer.case(LawtextAppPageActions.scrollLaw, (state, { tag, name }) => {
    scrollToLawAnchor(tag, name);
    return Object.assign({}, state, {});
});
