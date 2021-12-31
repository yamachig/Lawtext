import $ from "jquery";
import * as std from "lawtext/dist/src/law/std";
import { EL } from "lawtext/dist/src/node/el";
import * as renderer from "lawtext/dist/src/renderer";
import render_lawtext from "lawtext/dist/src/renderer/lawtext";
import { saveAs } from "file-saver";
import { getLawTitleWithNum } from "@appsrc/law_util";


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

    const origLawNum = origLaw.children.find((el) => typeof el !== "string" && el.tag === "LawNum") as EL;
    if (origLawNum) {
        law.append(origLawNum);
    }

    const origLawBody = origLaw.children.find((el) => typeof el !== "string" && el.tag === "LawBody") as EL;
    const lawBody = new EL(
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

    const findEls = (el: EL | string, tag: string) => {
        if (!(el instanceof EL)) return [];
        if (el.tag === tag) return [el];
        let ret: EL[] = [];
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
            const supplProvisionLabel = toplevel.children.find((el) => typeof el !== "string" && el.tag === "SupplProvisionLabel");
            if (supplProvisionLabel) containerChildren.unshift(supplProvisionLabel);
            lawBody.append(new EL(
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
    const xml = renderer.renderXml(law);
    const blob = new Blob(
        [xml],
        { type: "application/xml" },
    );
    const lawName = getLawTitleWithNum(law) || "lawtext_output";
    saveAs(blob, `${lawName}.xml`);
};
