import * as std from "lawtext/dist/src/law/std";
import { EL } from "lawtext/dist/src/node/el";
import * as renderer from "lawtext/dist/src/renderer";
import render_lawtext from "lawtext/dist/src/renderer/lawtext";
import type { FigDataManagerOptions } from "lawtext/dist/src/renderer/common/docx/FigDataManager";
import FigDataManager from "lawtext/dist/src/renderer/common/docx/FigDataManager";
import { saveAs } from "file-saver";
import { getLawTitleWithNum } from "@appsrc/law_util";
import { newStdEL } from "lawtext/dist/src/law/std";
import type { LawData } from "../lawdata/common";


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
        const el = node.parentNode as HTMLElement;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findData = (el: HTMLElement, key: string, func?: (data: any) => boolean): any | null => {
            const containerInfo = el.parentElement
                ? findData(el.parentElement as HTMLElement, key, func)
                : null;
            if (containerInfo) return containerInfo;
            const data = el.dataset[key] ? JSON.parse(el.dataset[key] ?? "") : null;
            if (!data) return null;
            return (!func || func(data)) ? data : null;
        };

        const containerInfo = findData(el, "container_info", (data) => ["Article", "Paragraph", "Item"].includes(data.tag));

        const toplevelContainerInfo = findData(el, "toplevel_container_info");
        if (!toplevelContainerInfo) return null;

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

export const containerInfoOf = (el: EL | string): {tag: string, id: string | number} => {
    if (typeof el === "string") {
        return { tag: "", id: "" };
    } else {
        return { tag: el.tag, id: el.id };
    }
};

const getLawRange = (origLaw: EL, range: SelectionRange) => {
    const sPos = range.start;
    const ePos = range.end;

    const law = new EL(
        origLaw.tag,
        origLaw.attr,
    );

    const origLawNum = origLaw.children.find(std.isLawNum);
    if (origLawNum) {
        law.children.push(origLawNum);
    }

    const origLawBody = origLaw.children.find(std.isLawBody);
    const lawBody = newStdEL(
        "LawBody",
        origLawBody?.attr ?? {},
    );
    law.children.push(lawBody);

    const origLawTitle = origLawBody?.children.find(std.isLawTitle);
    if (origLawTitle) {
        lawBody.children.push(origLawTitle);
    }


    let inContainerRange = false;
    let inItemRange = false;

    const findEls = (el: EL | string, tag: string) => {
        if (!(el instanceof EL)) return [];
        if (el.tag === tag) return [el];
        let ret: EL[] = [];
        for (const child of el.children) {
            ret = ret.concat(findEls(child, tag));
        }
        return ret;
    };

    for (const toplevel of origLawBody?.children ?? []) {
        const toplevelInfo = containerInfoOf(toplevel);
        if (typeof toplevel === "string") continue;
        if (
            !inContainerRange &&
            toplevelInfo.tag === sPos.container_tag &&
            toplevelInfo.id === sPos.container_id
        ) {
            inContainerRange = true;
        }

        const containerChildren: Array<EL | string> = [];

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
            const supplProvisionLabel = (toplevel.children as (typeof toplevel.children)[number][]).find(std.isSupplProvisionLabel);
            if (supplProvisionLabel) containerChildren.unshift(supplProvisionLabel);
            lawBody.children.push(newStdEL(
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

export const downloadDocx = async (options: {
    lawData: LawData,
    downloadSelection: boolean,
    figPDFType: FigDataManagerOptions["figPDFType"],
    onMessage?: (message: string | null) => void,
    longTimeSeconds?: number,
}): Promise<void> => {
    const { lawData, downloadSelection, figPDFType, onMessage, longTimeSeconds } = {
        longTimeSeconds: 5,
        ...options,
    };
    const range = downloadSelection ? tobeDownloadedRange() : null;
    const law = range ? getLawRange(lawData.el, range) as std.Law : lawData.el;

    let longTimeMessage = "";
    let lastInfo = {
        current: 0,
        length: 1,
        item: "",
    };

    const longTimeTimer = setTimeout(() => {
        longTimeMessage = "（処理に時間が掛かっています。Word保存メニューの\n「▼」から添付PDFの処理方法を変更できます）";
    }, longTimeSeconds * 1000);

    const updateMessage = (info?: {
        current: number;
        length: number;
        item: string;
    }) => {
        if (info) lastInfo = info;
        if (onMessage) {
            const message = `Wordファイル準備中: 添付PDFを処理しています (${lastInfo.current + 1} / ${lastInfo.length})`;
            onMessage(`${message}${longTimeMessage ? "\n" + longTimeMessage : ""}`);
        }
    };

    const figDataManager = ("lawXMLStruct" in lawData && lawData.lawXMLStruct)
        ? await FigDataManager.create({
            lawXMLStruct: lawData.lawXMLStruct,
            subsetLaw: law,
            figPDFType,
            ...(onMessage ? {
                onProgress: updateMessage,
            } : {}),
        })
        : undefined;

    clearTimeout(longTimeTimer);
    if (onMessage) onMessage(null);

    const buffer = await renderer.renderDocxAsync(law, { figDataManager });
    const blob = new Blob(
        [buffer],
        { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    );
    const lawName = getLawTitleWithNum(law) || "lawtext_output";
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
    const lawName = getLawTitleWithNum(law) || "lawtext_output";
    saveAs(blob, `${lawName}.law.txt`);
};

export const downloadXml = async (
    law: std.Law,
): Promise<void> => {
    const xml = renderer.renderXML(law);
    const blob = new Blob(
        [xml],
        { type: "application/xml" },
    );
    const lawName = getLawTitleWithNum(law) || "lawtext_output";
    saveAs(blob, `${lawName}.xml`);
};
