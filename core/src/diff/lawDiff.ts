import * as xpath from "xpath";
import { JsonEL } from "../node/el/jsonEL";
import * as util from "../util";
import { compare, EditTable } from "./editTable";
import * as std from "../law/std";

export enum TagType {
    // eslint-disable-next-line no-unused-vars
    Open = "Open",
    // eslint-disable-next-line no-unused-vars
    Close = "Close",
    // eslint-disable-next-line no-unused-vars
    Empty = "Empty",
    // eslint-disable-next-line no-unused-vars
    Text = "Text",
}

export interface LawDiffResult<T> {
    mostSeriousStatus: ProblemStatus;
    items: Array<LawDiffResultItem<T>>;
    oldRoot: ComparableEL,
    newRoot: ComparableEL,
    oldELs: Array<[ComparableEL, TagType]>;
    newELs: Array<[ComparableEL, TagType]>;
}

export type LawDiffResultItem<T> = LawDiffElementMismatch<T> | LawDiffElementChange<T> | LawDiffNoDiff<T>
export enum LawDiffType {
    // eslint-disable-next-line no-unused-vars
    ElementMismatch,
    // eslint-disable-next-line no-unused-vars
    ElementChange,
    // eslint-disable-next-line no-unused-vars
    NoDiff,
}

export interface LawDiffElementMismatch<T> {
    type: LawDiffType.ElementMismatch;
    mostSeriousStatus: ProblemStatus;
    diffTable: DiffTable<T>;
}

export interface LawDiffElementChange<T> {
    type: LawDiffType.ElementChange;
    mostSeriousStatus: ProblemStatus;
    diffTable: DiffTable<T>;
    nochangeKeys: string[];
    changedKeys: Array<[string, ProblemStatus]>;
    removedKeys: Array<[string, ProblemStatus]>;
    addedKeys: Array<[string, ProblemStatus]>;
    oldIndex: number;
    newIndex: number;
}

export interface LawDiffNoDiff<T> {
    type: LawDiffType.NoDiff;
    mostSeriousStatus: ProblemStatus.NoProblem;
    diffTable: DiffTable<T>;
}

export enum ProblemStatus {
    // eslint-disable-next-line no-unused-vars
    Error = 2,
    // eslint-disable-next-line no-unused-vars
    Warning = 1,
    // eslint-disable-next-line no-unused-vars
    NoProblem = 0,
}

export enum DiffStatus {
    // eslint-disable-next-line no-unused-vars
    Add = "Add",
    // eslint-disable-next-line no-unused-vars
    Remove = "Remove",
    // eslint-disable-next-line no-unused-vars
    Change = "Change",
    // eslint-disable-next-line no-unused-vars
    NoChange = "NoChange",
}

export type DiffTable<T> = Array<DiffTableRow<T>>;
export type DiffTableRow<T> = DiffAddRow<T> | DiffRemoveRow<T> | DiffChangeRow<T> | DiffNoChangeRow<T>;
export interface DiffAddRow<T> {
    status: DiffStatus.Add,
    oldItem: null,
    newItem: DiffTableItem<T>,
}
export interface DiffRemoveRow<T> {
    status: DiffStatus.Remove,
    oldItem: DiffTableItem<T>,
    newItem: null,
}
export interface DiffChangeRow<T> {
    status: DiffStatus.Change,
    oldItem: DiffTableItem<T> | null,
    newItem: DiffTableItem<T> | null,
}
export interface DiffNoChangeRow<T> {
    status: DiffStatus.NoChange,
    oldItem: DiffTableItem<T>,
    newItem: DiffTableItem<T>,
}
export interface DiffTableItem<T> {
    index: number,
    value: T,
}

const defaultAttr = new Map([
    ["Delete", "false"],
    ["Hide", "false"],
    ["OldStyle", "false"],
    ["WritingMode", "vertical"],
    ["LineBreak", "false"],
    ["BorderTop", "solid"],
    ["BorderBottom", "solid"],
    ["BorderLeft", "solid"],
    ["BorderRight", "solid"],
    ["Style", "solid"],

    ["Extract", "false"],
]);

const warningAttrKey = new Set([
    "PromulgateMonth",
    "PromulgateDay",
    "Kana",
    "Abbrev",
    "AbbrevKana",
    "Num",
    "Type",
    "Function",
    "DataInfo",
    "AmendLawId",
    "AmendmentId",
    "AmendmentNum",
    "Id",
]);

const warnEmptyAddRemoveTags: std.StdELTag[] = [
    ...std.appdxItemTitleTags,
    ...std.supplProvisionAppdxItemTitleTags,
];

export class ComparableEL implements JsonEL {
    public tag = "";
    public attr: { [key: string]: string | undefined } = {};
    public children: ComparableEL[] = [];
    public index: number;
    public closeIndex: number;
    public nextIndex: number;
    public parent?: ComparableEL;
    public textCache: string | null = null;

    constructor(el: JsonEL | string, parent?: ComparableEL, index = 0) {
        this.index = index;
        this.parent = parent;
        this.nextIndex = index + 1;
        if (typeof el === "string") {
            this.tag = "";
            this.attr = {};
            this.textCache = el;
        } else {
            this.tag = el.tag;
            this.attr = el.attr;
            this.children = el.children.map(child => {
                const ret = new ComparableEL(child, this, this.nextIndex);
                this.nextIndex = ret.nextIndex;
                return ret;
            });
        }
        if (this.nextIndex === index + 1) {
            this.closeIndex = index;
        } else {
            this.closeIndex = this.nextIndex;
            this.nextIndex++;
        }
    }

    get text(): string {
        if (this.textCache === null) {
            this.textCache = this.children.map(child => child instanceof ComparableEL ? child.text : child).join("／");
        }
        return this.textCache;
    }

    public *allList(): IterableIterator<[ComparableEL, TagType]> {
        if (this.children.length) {
            yield [this, TagType.Open];
            for (const child of this.children) {
                yield* child.allList();
            }
            yield [this, TagType.Close];
        } else {
            yield [this, this.tag ? TagType.Empty : TagType.Text];
        }
    }

    public getXPath(): string {
        if (this.parent) {
            if (this.tag === "") {
                return `${this.parent.getXPath()}/text()`;
            } else {
                let sameTagCount = 0;
                let position = 0;
                for (const child of this.parent.children) {
                    if (child.tag === this.tag) sameTagCount++;
                    if (child === this) position = sameTagCount;
                }
                if (sameTagCount === 1) {
                    return `${this.parent.getXPath()}/${this.tag}`;
                } else {
                    return `${this.parent.getXPath()}/${this.tag}[${position}]`;
                }
            }
        } else {
            return `/${this.tag}`;
        }
    }
}

const truncateTags: std.StdELTag[] = [
    "ArticleCaption",
    "TOCLabel",
    ...std.tocItemTags,
    ...std.paragraphItemTags,
    ...std.listOrSublistTags,
    "TableColumn",
    ...std.noteLikeTags,
    "FigStruct",
    ...std.appdxItemTitleTags,
    ...std.supplProvisionAppdxItemTitleTags,
    "RelatedArticleNum",
    "Remarks",
];

const truncateELs = (els: [ComparableEL, TagType][]) => {
    const ret: [ComparableEL, TagType][] = [];
    let closeIndex: number | null = null;
    for (const [el, tagType] of els) {
        if ((closeIndex !== null) && (el.index <= closeIndex)) continue;
        closeIndex = null;
        if ((truncateTags as string[]).includes(el.tag)) {
            closeIndex = el.closeIndex;
        } else if (tagType !== TagType.Close) {
            ret.push([el, tagType]);
        }
    }
    return ret;
};

const elsToTexts = (els: [ComparableEL, TagType][]) => {
    return els.map(([el, tt]) => {
        if (tt === TagType.Open) {
            return `<${el.tag}>`;

        } else if (tt === TagType.Close) {
            return `</${el.tag}>`;

        } else if (tt === TagType.Empty) {
            return `<${el.tag} />`;

        } else if (tt === TagType.Text) {
            return `${el.text.replace(/\r|\n/, "")}`;

        } else { throw util.assertNever(tt); }
    });
};

export enum LawDiffMode {
    // eslint-disable-next-line no-unused-vars
    DiffAll = "DiffAll",
    // eslint-disable-next-line no-unused-vars
    NoProblemAsNoDiff = "NoProblemAsNoDiff",
    // eslint-disable-next-line no-unused-vars
    WarningAsNoDiff = "WarningAsNoDiff",
}

export const lawDiff = (oldJson: JsonEL, newJson: JsonEL, lawDiffMode: LawDiffMode = LawDiffMode.DiffAll): LawDiffResult<string> => {

    const oldRoot = new ComparableEL(oldJson);
    const origOldELs = [...oldRoot.allList()];
    if (!origOldELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const newRoot = new ComparableEL(newJson);
    const origNewELs = [...newRoot.allList()];
    if (!origNewELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const trOldELs = truncateELs(origOldELs);
    const trNewELs = truncateELs(origNewELs);
    const [trOldTexts, trNewTexts] = [trOldELs, trNewELs].map(elsToTexts);
    const trTextEdit = tuneEditTable(compare(trOldTexts, trNewTexts), trOldELs, trNewELs);
    const trDiff = collapseChange(trTextEdit);

    const origDRows: DiffTableRow<string>[] = [];

    for (let trI = 0; trI < trDiff.length; trI++) {
        const trDRow = trDiff[trI];

        const oldELsRange: [number, number] = [-1, -1]; // half-open
        if (trDRow.oldItem) {
            const [el, type] = trOldELs[trDRow.oldItem.index];
            oldELsRange[0] = (trI === 0) ? 0 : (type === TagType.Close ? el.closeIndex : el.index);
            oldELsRange[1] = origOldELs.length;
            for (let trII = trI + 1; trII < trDiff.length; trII++) {
                const nextTrDRow = trDiff[trII];
                if (!nextTrDRow.oldItem) continue;
                const [el, type] = trOldELs[nextTrDRow.oldItem.index];
                oldELsRange[1] = (type === TagType.Close ? el.closeIndex : el.index);
                break;
            }
        }

        const newELsRange: [number, number] = [-1, -1]; // half-open
        if (trDRow.newItem) {
            const [el, type] = trNewELs[trDRow.newItem.index];
            newELsRange[0] = (trI === 0) ? 0 : (type === TagType.Close ? el.closeIndex : el.index);
            newELsRange[1] = origNewELs.length;
            for (let trII = trI + 1; trII < trDiff.length; trII++) {
                const nextTrDRow = trDiff[trII];
                if (!nextTrDRow.newItem) continue;
                const [el, type] = trNewELs[nextTrDRow.newItem.index];
                newELsRange[1] = (type === TagType.Close ? el.closeIndex : el.index);
                break;
            }
        }

        if ((oldELsRange[1] - oldELsRange[0] <= 1) && (newELsRange[1] - newELsRange[0] <= 1)) {
            const origDRow = {
                ...trDRow,
                oldItem: (
                    trDRow.oldItem
                        ? {
                            ...trDRow.oldItem,
                            index: trOldELs[trDRow.oldItem.index][0].index,
                        }
                        : null
                ),
                newItem: (
                    trDRow.newItem
                        ? {
                            ...trDRow.newItem,
                            index: trNewELs[trDRow.newItem.index][0].index,
                        }
                        : null
                ),
            } as typeof trDRow;
            origDRows.push(origDRow);

        } else {

            const partOldELs = origOldELs.slice(...oldELsRange);
            const partNewELs = origNewELs.slice(...newELsRange);

            const [oldTexts, newTexts] = [partOldELs, partNewELs].map(elsToTexts);

            let editTable: EditTable<string> | null = null;
            try {
                editTable = compare(oldTexts, newTexts);
            } catch (e) { /**/ }

            if (editTable) {
                const partTextEdit = tuneEditTable(editTable, partOldELs, partNewELs);
                const partDiff = collapseChange(partTextEdit);

                for (const partDRow of partDiff) {
                    const origDRow = {
                        ...partDRow,
                        oldItem: (
                            partDRow.oldItem
                                ? {
                                    ...partDRow.oldItem,
                                    index: partDRow.oldItem.index + oldELsRange[0],
                                }
                                : null
                        ),
                        newItem: (
                            partDRow.newItem
                                ? {
                                    ...partDRow.newItem,
                                    index: partDRow.newItem.index + newELsRange[0],
                                }
                                : null
                        ),
                    } as typeof partDRow;
                    origDRows.push(origDRow);
                }
            } else {
                const maxLength = Math.max(partOldELs.length, partNewELs.length);
                for (let i = 0; i < maxLength; i++) {
                    const origDRow: DiffTableRow<string> = {
                        status: DiffStatus.Change,
                        oldItem: (
                            (i < partOldELs.length)
                                ? {
                                    index: i,
                                    value: oldTexts[i],
                                }
                                : null
                        ),
                        newItem: (
                            (i < partNewELs.length)
                                ? {
                                    index: i,
                                    value: newTexts[i],
                                }
                                : null
                        ),
                    };
                    origDRows.push(origDRow);
                }
            }
        }

    }

    const warningChangeELsList: Exclude<ReturnType<typeof detectWarningChangeELs>, null>[] = [];

    const origRetItems: LawDiffResultItem<string>[] = [];

    for (const [origDRowI, origDRow] of origDRows.entries()) {
        const origOldIndex = origDRow.oldItem && origDRow.oldItem.index;
        const origNewIndex = origDRow.newItem && origDRow.newItem.index;

        const [oldEL, oldTT] = origOldIndex ? origOldELs[origOldIndex] : [null, null];
        const [newEL, newTT] = origNewIndex ? origNewELs[origNewIndex] : [null, null];

        const isWarningChangeEL = warningChangeELsList.some(els => {
            const oldIsFragment = !oldEL || 0 <= els.oldELs.indexOf(oldEL);
            const newIsFragment = !newEL || 0 <= els.newELs.indexOf(newEL);
            return oldIsFragment && newIsFragment;
        });

        if (origDRow.status !== DiffStatus.NoChange && isWarningChangeEL) {
            if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                origRetItems.push({
                    type: LawDiffType.NoDiff,
                    mostSeriousStatus: ProblemStatus.NoProblem,
                    diffTable: [origDRow],
                });

            } else {
                origRetItems.push({
                    type: LawDiffType.ElementMismatch,
                    mostSeriousStatus: ProblemStatus.Warning,
                    diffTable: [origDRow],
                });
            }

        } else if (origDRow.status === DiffStatus.NoChange) {
            const r = processNoChange(origDRow, origOldELs, origNewELs, lawDiffMode === LawDiffMode.NoProblemAsNoDiff || lawDiffMode === LawDiffMode.WarningAsNoDiff);
            if (r && (
                (lawDiffMode === LawDiffMode.NoProblemAsNoDiff
                && ProblemStatus.NoProblem < r.mostSeriousStatus) ||
                (lawDiffMode === LawDiffMode.WarningAsNoDiff
                    && ProblemStatus.Warning < r.mostSeriousStatus) ||
                (lawDiffMode === LawDiffMode.DiffAll)
            )) {
                origRetItems.push(r);
            } else {
                origRetItems.push({
                    type: LawDiffType.NoDiff,
                    mostSeriousStatus: ProblemStatus.NoProblem,
                    diffTable: [origDRow],
                });
            }

        } else if (
            (origDRow.status === DiffStatus.Change) ||
            (origDRow.status === DiffStatus.Remove) ||
            (origDRow.status === DiffStatus.Add)
        ) {

            let origDRowToDetect: DiffTableRow<string> | null = null;

            if (origDRow.status === DiffStatus.Change) {
                origDRowToDetect = origDRow;

            } else if ((origDRow.status === DiffStatus.Remove) && (oldTT === TagType.Open)) {
                let origDRowIClose: number | null = null;
                let origDRowIText: number | null = null;
                let noChangeMiddle = true;
                const maxD = 2 * (oldEL.closeIndex - oldEL.index);
                for (let i = origDRowI + 1; i < Math.min(origDRows.length, origDRowI + maxD + 1); i++) {
                    const row = origDRows[i];
                    if ((row.status === DiffStatus.Remove) && (row.oldItem.index === oldEL.closeIndex)) {
                        origDRowIClose = i;
                        break;
                    }
                    if (row.status !== DiffStatus.NoChange) {
                        noChangeMiddle = false;
                        break;
                    }
                    if (
                        (origOldELs[row.oldItem.index][1] === TagType.Text) &&
                        (origNewELs[row.newItem.index][1] === TagType.Text)
                    ) {
                        origDRowIText = i;
                    }
                }
                if (noChangeMiddle && (origDRowIClose !== null) && (origDRowIText !== null) && (origDRowIClose - origDRowI >= 2)) {
                    origDRowToDetect = origDRows[origDRowIText];
                }

            } else if ((origDRow.status === DiffStatus.Add) && (newTT === TagType.Open)) {
                let origDRowIClose: number | null = null;
                let origDRowIText: number | null = null;
                let noChangeMiddle = true;
                const maxD = 2 * (newEL.closeIndex - newEL.index);
                for (let i = origDRowI + 1; i < Math.min(origDRows.length, origDRowI + maxD + 1); i++) {
                    const row = origDRows[i];
                    if ((row.status === DiffStatus.Add) && (row.newItem.index === newEL.closeIndex)) {
                        origDRowIClose = i;
                        break;
                    }
                    if (row.status !== DiffStatus.NoChange) {
                        noChangeMiddle = false;
                        break;
                    }
                    if (
                        (origNewELs[row.newItem.index][1] === TagType.Text) &&
                        (origOldELs[row.oldItem.index][1] === TagType.Text)
                    ) {
                        origDRowIText = i;
                    }
                }
                if (noChangeMiddle && (origDRowIClose !== null) && (origDRowIText !== null) && (origDRowIClose - origDRowI >= 2)) {
                    origDRowToDetect = origDRows[origDRowIText];
                }
            }

            const r = origDRowToDetect && detectWarningChangeELs(origDRowToDetect, origOldELs, origNewELs);

            if (origDRowToDetect && r) {

                // process future LawDiff
                warningChangeELsList.push(r);

                {
                    // overwrite already processed LawDiff

                    const firstOldELIndex = origOldELs.findIndex(([el]) => el === r.oldELs[0]);
                    const firstNewELIndex = origNewELs.findIndex(([el]) => el === r.newELs[0]);

                    if (
                        (origDRowToDetect.oldItem && (firstOldELIndex < origDRowToDetect.oldItem.index)) &&
                        (origDRowToDetect.newItem && (firstNewELIndex < origDRowToDetect.newItem.index))
                    ) {

                        // Max rollback length of LawDiff[]
                        // (length of LawDiff[] <= 2 * (length of ComparableEL[]))
                        const maxDI = 2 * Math.max(
                            (origDRowToDetect.oldItem.index - firstOldELIndex),
                            (origDRowToDetect.newItem.index - firstNewELIndex),
                        );

                        for (let i = origRetItems.length - 1; i >= (origRetItems.length - 1 - maxDI); i--) {

                            const iDiffItem = origRetItems[i];

                            if (
                                (
                                    iDiffItem.diffTable[0].oldItem &&
                                    (iDiffItem.diffTable[0].oldItem.index < firstOldELIndex)
                                ) ||
                                (
                                    iDiffItem.diffTable[0].newItem &&
                                    (iDiffItem.diffTable[0].newItem.index < firstNewELIndex)
                                )
                            ) {
                                break;
                            }

                            if (iDiffItem.mostSeriousStatus > ProblemStatus.Warning) {
                                if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                                    (iDiffItem as LawDiffResultItem<string>).type = LawDiffType.NoDiff;
                                    iDiffItem.mostSeriousStatus = ProblemStatus.NoProblem;
                                } else {
                                    iDiffItem.mostSeriousStatus = ProblemStatus.Warning;
                                }
                            }
                        }
                    }
                }

                // process current LawDiff
                if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                    origRetItems.push({
                        type: LawDiffType.NoDiff,
                        mostSeriousStatus: ProblemStatus.NoProblem,
                        diffTable: [origDRow],
                    });
                } else {
                    origRetItems.push({
                        type: LawDiffType.ElementMismatch,
                        mostSeriousStatus: ProblemStatus.Warning,
                        diffTable: [origDRow],
                    });
                }

            } else {
                if (origDRow.status === DiffStatus.Change) {
                    origRetItems.push({
                        type: LawDiffType.ElementMismatch,
                        mostSeriousStatus: ProblemStatus.Error,
                        diffTable: [origDRow],
                    });
                } else if (origDRow.status === DiffStatus.Remove) {
                    if (oldEL && (warnEmptyAddRemoveTags as string[]).includes(oldEL.tag)) {
                        origRetItems.push({
                            type: LawDiffType.ElementMismatch,
                            mostSeriousStatus: ProblemStatus.Warning,
                            diffTable: [origDRow],
                        });

                    } else {
                        origRetItems.push({
                            type: LawDiffType.ElementMismatch,
                            mostSeriousStatus: ProblemStatus.Error,
                            diffTable: [origDRow],
                        });
                    }
                } else if (origDRow.status === DiffStatus.Add) {
                    if (newEL && (warnEmptyAddRemoveTags as string[]).includes(newEL.tag)) {
                        origRetItems.push({
                            type: LawDiffType.ElementMismatch,
                            mostSeriousStatus: ProblemStatus.Warning,
                            diffTable: [origDRow],
                        });

                    } else {
                        origRetItems.push({
                            type: LawDiffType.ElementMismatch,
                            mostSeriousStatus: ProblemStatus.Error,
                            diffTable: [origDRow],
                        });
                    }
                }
            }

        } else { throw util.assertNever(origDRow); }
    }

    const ret: LawDiffResult<string> = {
        mostSeriousStatus: ProblemStatus.NoProblem,
        items: [],
        oldRoot,
        newRoot,
        oldELs: origOldELs,
        newELs: origNewELs,
    };

    const noDiffTable: LawDiffNoDiff<string>[] = [];

    const emitNoDiff = () => {
        if (noDiffTable.length !== 0) {
            ret.items.push({
                type: LawDiffType.NoDiff,
                mostSeriousStatus: ProblemStatus.NoProblem,
                diffTable: ([] as DiffTable<string>).concat(...noDiffTable.map(d => d.diffTable)),
            });
            noDiffTable.splice(0, noDiffTable.length);
        }
    };

    for (const origRetItem of origRetItems) {
        if (origRetItem.type === LawDiffType.NoDiff) {
            noDiffTable.push(origRetItem);

        } else {
            emitNoDiff();
            ret.items.push(origRetItem);
        }
    }

    emitNoDiff();

    for (const { mostSeriousStatus } of ret.items) {
        ret.mostSeriousStatus = Math.max(ret.mostSeriousStatus, mostSeriousStatus);
    }

    return ret;

};

const processNoChange = (dRow: DiffTableRow<string>, oldELs: Array<[ComparableEL, TagType]>, newELs: Array<[ComparableEL, TagType]>, noProblemAsNoDiff: boolean): LawDiffElementChange<string> | null => {
    if (!dRow.oldItem || !dRow.newItem) return null;
    const oldIndex = dRow.oldItem.index;
    const newIndex = dRow.newItem.index;

    const [oldEL, oldTT] = oldELs[oldIndex];
    const [newEL, newTT] = newELs[newIndex];

    if (
        (oldTT === TagType.Open || oldTT === TagType.Empty) &&
        (newTT === TagType.Open || newTT === TagType.Empty)
    ) {

        const oldKeys = Object.keys(oldEL.attr);
        const newKeys = Object.keys(newEL.attr);

        const nochangeKeys: string[] = [];
        const changedKeys: Array<[string, ProblemStatus]> = [];
        for (const key of oldKeys.filter(x => newKeys.includes(x))) {
            let oldVal;
            let newVal;

            if (key === "Year") {
                oldVal = Number(oldEL.attr[key]);
                newVal = Number(newEL.attr[key]);

            } else {
                oldVal = oldEL.attr[key];
                newVal = newEL.attr[key];
            }

            if (oldVal !== newVal) {
                changedKeys.push([key, warningAttrKey.has(key) ? ProblemStatus.Warning : ProblemStatus.Error]);
            } else {
                nochangeKeys.push(key);
            }
        }

        const removedKeys: Array<[string, ProblemStatus]> = [];
        for (const key of oldKeys.filter(x => !newKeys.includes(x))) {
            if (defaultAttr.get(key) === oldEL.attr[key]) {
                removedKeys.push([key, ProblemStatus.NoProblem]);
            } else {
                removedKeys.push([key, warningAttrKey.has(key) ? ProblemStatus.Warning : ProblemStatus.Error]);
            }
        }

        const addedKeys: Array<[string, ProblemStatus]> = [];
        for (const key of newKeys.filter(x => !oldKeys.includes(x))) {
            if (defaultAttr.get(key) === newEL.attr[key]) {
                addedKeys.push([key, ProblemStatus.NoProblem]);
            } else {
                addedKeys.push([key, warningAttrKey.has(key) ? ProblemStatus.Warning : ProblemStatus.Error]);
            }
        }

        let elementMostSeriousStatus: ProblemStatus = ProblemStatus.NoProblem;
        for (const [/**/, status] of [...changedKeys, ...removedKeys, ...addedKeys]) {
            if (elementMostSeriousStatus === ProblemStatus.Error) break;
            if (elementMostSeriousStatus < status) elementMostSeriousStatus = status;
        }

        if (
            !(noProblemAsNoDiff && elementMostSeriousStatus === ProblemStatus.NoProblem)
            && (changedKeys.length || removedKeys.length || addedKeys.length)
        ) {

            return {
                type: LawDiffType.ElementChange,
                mostSeriousStatus: elementMostSeriousStatus,
                diffTable: [dRow],
                nochangeKeys,
                changedKeys,
                removedKeys,
                addedKeys,
                oldIndex,
                newIndex,
            };
        }
    }

    return null;
};

const detectWarningChangeELs = (dRow: DiffTableRow<string>, oldELs: Array<[ComparableEL, TagType]>, newELs: Array<[ComparableEL, TagType]>): {
    oldELs: ComparableEL[];
    newELs: ComparableEL[];
} | null => {
    if (!dRow.oldItem || !dRow.newItem) return null;
    const oldIndex = dRow.oldItem.index;
    const newIndex = dRow.newItem.index;

    const [oldEL, oldTT] = oldELs[oldIndex];
    const [newEL, newTT] = newELs[newIndex];

    if (oldTT === TagType.Text && newTT === TagType.Text) {

        if (
            oldEL.parent && newEL.parent &&
            oldEL.parent.tag === "Sentence" && newEL.parent.tag === "Sentence"
        ) {

            const oldSentence = oldEL.parent;
            const newSentence = newEL.parent;

            const [oldSentences, newSentences] = [oldSentence, newSentence].map(sentence => {
                const p = sentence.parent;
                if (!p) return [sentence];
                const ret: ComparableEL[] = [];
                for (const child of p.children) {
                    if (child.tag === sentence.tag) ret.push(child);
                    else break;
                }
                return ret.includes(sentence) ? ret : null;
            });

            const oldSentencesJoinText = oldSentences?.map(el => el.text).join("") ?? null;
            const newSentencesJoinText = newSentences?.map(el => el.text).join("") ?? null;

            const [oldColumns, newColumns] = [oldSentence, newSentence].map(sentence => {
                if (!sentence.parent) return null;
                if (sentence.parent.tag !== "Column") return null;
                const column = sentence.parent;
                if (!column.children.every(el => el.tag === "Sentence")) return null;

                const p = column.parent;
                if (!p) return [column];
                const ret: ComparableEL[] = [];
                for (const child of p.children) {
                    if (child.tag === column.tag) ret.push(child);
                    else break;
                }
                return ret.includes(column) ? ret : null;
            });

            const oldColumnsJoinText = oldColumns?.map(el => el.children.map(ch => ch.text).join("")).join("　") ?? null;
            const newColumnsJoinText = newColumns?.map(el => el.children.map(ch => ch.text).join("")).join("　") ?? null;

            if (oldColumns && newColumns && (oldColumnsJoinText === newColumnsJoinText)) {
                return {
                    oldELs: ([] as ComparableEL[])
                        .concat(...oldColumns.map(el => Array.from(el.allList()).map(([e]) => e))),
                    newELs: ([] as ComparableEL[])
                        .concat(...newColumns.map(el => Array.from(el.allList()).map(([e]) => e))),
                };
            }

            if (oldSentences && newColumns && (oldSentencesJoinText === newColumnsJoinText)) {
                return {
                    oldELs: ([] as ComparableEL[])
                        .concat(...oldSentences.map(el => Array.from(el.allList()).map(([e]) => e))),
                    newELs: ([] as ComparableEL[])
                        .concat(...newColumns.map(el => Array.from(el.allList()).map(([e]) => e))),
                };
            }

            if (oldColumns && newSentences && (oldColumnsJoinText === newSentencesJoinText)) {
                return {
                    oldELs: ([] as ComparableEL[])
                        .concat(...oldColumns.map(el => Array.from(el.allList()).map(([e]) => e))),
                    newELs: ([] as ComparableEL[])
                        .concat(...newSentences.map(el => Array.from(el.allList()).map(([e]) => e))),
                };
            }

            if (oldSentences && newSentences && (oldSentencesJoinText === newSentencesJoinText)) {
                return {
                    oldELs: ([] as ComparableEL[])
                        .concat(...oldSentences.map(el => Array.from(el.allList()).map(([e]) => e))),
                    newELs: ([] as ComparableEL[])
                        .concat(...newSentences.map(el => Array.from(el.allList()).map(([e]) => e))),
                };
            }
        }

        if (
            oldEL.parent && newEL.parent &&
            oldEL.parent.tag === "AppdxTableTitle" && newEL.parent.tag === "AppdxTableTitle"
        ) {
            const oldP = oldEL.parent;
            const newP = newEL.parent;

            const [oldTitles, newTitles] = [oldP, newP].map(el => {
                const p = el.parent;
                if (!p) return [el];
                const ret: ComparableEL[] = [];
                for (let i = p.children.indexOf(el); i < p.children.length; i++) {
                    if (p.children[i].tag === "AppdxTableTitle" || p.children[i].tag === "RelatedArticleNum") ret.push(p.children[i]);
                    else break;
                }
                return ret;
            });
            const oldJoinText = oldTitles.map(el => el.text).join("");
            const newJoinText = newTitles.map(el => el.text).join("");
            if (oldJoinText === newJoinText) {
                return {
                    oldELs: ([] as ComparableEL[])
                        .concat(...oldTitles.map(el => Array.from(el.allList()).map(([e ]) => e))),
                    newELs: ([] as ComparableEL[])
                        .concat(...newTitles.map(el => Array.from(el.allList()).map(([e ]) => e))),
                };
            }
        }
    } else if (
        (oldTT === TagType.Open || oldTT === TagType.Empty) &&
        (newTT === TagType.Open || newTT === TagType.Empty)
    ) {

        if (
            (oldEL.tag === newEL.tag) &&
            (std.paragraphItemSentenceTags as readonly string[]).includes(oldEL.tag) &&
            [oldEL, newEL].every(oldnewEL => (
                (oldnewEL.children.length === 0) ||
                (oldnewEL.children.every(c => (c.tag === "Sentence") && (c.children.length === 0)))
            ))
        ) {
            const retMap = (oldnewEL: ComparableEL) => (
                Array.from(oldnewEL.allList()).map(([e]) => e)
            );
            return {
                oldELs: retMap(oldEL),
                newELs: retMap(newEL),
            };
        }
    }
    return null;
};

const tuneEditTable = <T, O extends {tag: string}>(table: EditTable<T>, oldELs: Array<[O, TagType]>, newELs: Array<[O, TagType]>) => {
    const ret: EditTable<T> = [];
    let nextEmitPos = 0;
    let startPos: number | null = null;
    let endPos: number | null = null;
    for (const [pos, [oldItem, newItem]] of table.entries()) {
        if (startPos === null) {
            if (!(oldItem && !newItem)) continue;
            startPos = pos;
        }
        if (!(oldItem && !newItem)) {
            endPos = pos - 1;
        } else if (pos === table.length - 1) {
            endPos = pos;
        }

        if (startPos !== null && endPos !== null) {
            let moveCount = 0;
            for (let count = 1; count < endPos - startPos; count++) {
                const [moveItem /**/] = table[endPos + 1 - count];
                if (!moveItem) break;
                const [moveIndex /**/] = moveItem;
                const [moveEL, moveTT] = oldELs[moveIndex];
                if (moveTT !== TagType.Open) break;

                const [oi, ni] = table[startPos - count];
                if (!oi || !ni) break;
                const [newIndex /**/] = ni;
                const [newEL, newTT] = newELs[newIndex];
                if (newTT !== TagType.Open) break;

                if (moveEL.tag !== newEL.tag) break;
                moveCount = count;
            }
            for (let p = nextEmitPos; p < startPos - moveCount; p++) {
                ret.push(table[p]);
            }
            for (let p = startPos - moveCount; p < startPos; p++) {
                const [oi /**/] = table[p];
                if (!oi) throw new Error("never");
                ret.push([oi, null]);
            }
            for (let p = startPos; p < endPos + 1 - moveCount; p++) {
                ret.push(table[p]);
            }
            for (let p = endPos + 1 - moveCount; p <= endPos; p++) {
                const [oi /**/] = table[p];
                const [/**/, ni] = table[startPos - (endPos + 1 - p)];
                if (!oi || !ni) throw new Error("never");
                ret.push([oi, ni]);
            }
            nextEmitPos = endPos + 1;
            startPos = null;
            endPos = null;
        }
    }
    for (let pos = nextEmitPos; pos < table.length; pos++) {
        ret.push(table[pos]);
    }

    return ret;
};

const collapseChange = <T>(diff: EditTable<T>) => {
    const ret: DiffTable<T> = [];
    let startPos: number | null = null;
    let endPos: number | null = null;
    let status: DiffStatus = DiffStatus.NoChange;
    for (const [pos, [oldItem, newItem]] of diff.entries()) {

        if (startPos === null) {
            if (oldItem && newItem) {
                ret.push({
                    status: DiffStatus.NoChange,
                    oldItem: { index: oldItem[0], value: oldItem[1] },
                    newItem: { index: newItem[0], value: newItem[1] },
                });
                continue;
            }
            startPos = pos;
        }

        if (!oldItem && newItem) {
            if (status === DiffStatus.Remove || status === DiffStatus.Change) {
                status = DiffStatus.Change;
            } else {
                status = DiffStatus.Add;
            }
        } else if (oldItem && !newItem) {
            if (status === DiffStatus.Add || status === DiffStatus.Change) {
                status = DiffStatus.Change;
            } else {
                status = DiffStatus.Remove;
            }
        }

        if (oldItem && newItem) {
            endPos = pos - 1;
        } else if (pos === diff.length - 1) {
            endPos = pos;
        }

        if (endPos !== null && startPos !== null) {
            const oldItems: Array<DiffTableItem<T>> = [];
            const newItems: Array<DiffTableItem<T>> = [];
            for (let p = startPos; p <= endPos; p++) {
                const [oi, ni] = diff[p];
                if (oi) oldItems.push({ index: oi[0], value: oi[1] });
                if (ni) newItems.push({ index: ni[0], value: ni[1] });
            }
            const maxLength = Math.max(oldItems.length, newItems.length);
            for (let i = 0; i < maxLength; i++) {
                ret.push({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
                    status: status as any,
                    oldItem: oldItems[i] || null,
                    newItem: newItems[i] || null,
                });
            }

            status = DiffStatus.NoChange;
            startPos = null;
            endPos = null;
        }
        if (oldItem && newItem) {
            ret.push({
                status: DiffStatus.NoChange,
                oldItem: { index: oldItem[0], value: oldItem[1] },
                newItem: { index: newItem[0], value: newItem[1] },
            });
        }
    }
    return ret;
};

export interface LawPosition {
    line: number,
    col: number,
    str: string,
}

const getPosition = ([el, tt]: [ComparableEL, TagType], dom: Node): LawPosition | null => {
    let xPathString: string | null = null;
    if (tt === TagType.Open) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Empty) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Close) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Text) {
        if (el.parent) {
            xPathString = el.parent.getXPath();
        }

    } else { throw util.assertNever(tt); }

    if (xPathString) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const r = (xpath as any).selectWithResolver(
                xPathString,
                dom,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                (xpath as any).createNSResolver(dom),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (xpath as any).XPathResult.ANY_TYPE,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                null as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const rel = r[0];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            return { line: rel.lineNumber, col: rel.columnNumber, str: `${rel.lineNumber}:${rel.columnNumber}` };
        } catch (e) {
            console.error(e);
            console.error(xPathString);
            return null;
        }
    } else {
        return null;
    }
};


export type LawDiffResultItemData = LawDiffElementMismatchData | LawDiffElementChangeData | LawDiffNoDiffData;

export interface LawDiffElementMismatchData {
    type: LawDiffType.ElementMismatch;
    mostSeriousStatus: ProblemStatus;
    diffTable: DiffTableData;
}

export interface LawDiffElementChangeData {
    type: LawDiffType.ElementChange;
    mostSeriousStatus: ProblemStatus;
    nochangeKeys: string[];
    changedKeys: Array<[string, ProblemStatus]>;
    removedKeys: Array<[string, ProblemStatus]>;
    addedKeys: Array<[string, ProblemStatus]>;
    oldItem: DiffTableItemData;
    newItem: DiffTableItemData;
}

export interface LawDiffNoDiffData {
    type: LawDiffType.NoDiff;
    mostSeriousStatus: ProblemStatus.NoProblem;
    diffTable: DiffTableData;
}

export type DiffTableData = DiffTableRowData[];
export type DiffTableRowData = DiffAddRowData | DiffRemoveRowData | DiffChangeRowData | DiffNoChangeRowData;
export interface DiffAddRowData {
    status: DiffStatus.Add,
    oldItem: null,
    newItem: DiffTableItemData,
}
export interface DiffRemoveRowData {
    status: DiffStatus.Remove,
    oldItem: DiffTableItemData,
    newItem: null,
}
export interface DiffChangeRowData {
    status: DiffStatus.Change,
    oldItem: DiffTableItemData | null,
    newItem: DiffTableItemData | null,
}
export interface DiffNoChangeRowData {
    status: DiffStatus.NoChange,
    oldItem: DiffTableItemData,
    newItem: DiffTableItemData,
}
export interface DiffTableItemData {
    tag: string,
    attr: { [key: string]: string | undefined },
    text: string,
    type: TagType,
    pos: LawPosition | null,
}

export const makeDiffData = (d: LawDiffResult<string>, origDOM: Node, parsedDOM: Node): LawDiffResultItemData[] => {

    const ret: LawDiffResultItemData[] = [];

    for (const ditem of d.items) {
        if (ditem.type === LawDiffType.ElementMismatch || ditem.type === LawDiffType.NoDiff) {
            const table: DiffTableData = [];
            for (const dRow of ditem.diffTable) {
                let oldItem: DiffTableItemData | null = null;
                let newItem: DiffTableItemData | null = null;
                if (dRow.oldItem) {
                    const [oldEL, oldTT] = d.oldELs[dRow.oldItem.index];
                    const oldPos = ditem.type === LawDiffType.ElementMismatch ? getPosition([oldEL, oldTT], origDOM) : null;
                    oldItem = {
                        tag: oldEL.tag,
                        attr: oldEL.attr,
                        text: (oldTT === TagType.Text ? oldEL.text : ""),
                        type: oldTT,
                        pos: oldPos,
                    };
                }
                if (dRow.newItem) {
                    const [newEL, newTT] = d.newELs[dRow.newItem.index];
                    const newPos = ditem.type === LawDiffType.ElementMismatch ? getPosition([newEL, newTT], parsedDOM) : null;
                    newItem = {
                        tag: newEL.tag,
                        attr: newEL.attr,
                        text: (newTT === TagType.Text ? newEL.text : ""),
                        type: newTT,
                        pos: newPos,
                    };
                }
                table.push({
                    status: dRow.status,
                    oldItem,
                    newItem,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);
            }
            ret.push({
                type: ditem.type,
                mostSeriousStatus: ditem.mostSeriousStatus,
                diffTable: table,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

        } else if (ditem.type === LawDiffType.ElementChange) {
            let oldItem: DiffTableItemData | null = null;
            let newItem: DiffTableItemData | null = null;

            const [oldEL, oldTT] = d.oldELs[ditem.oldIndex];
            const oldPos = getPosition([oldEL, oldTT], origDOM);
            oldItem = {
                tag: oldEL.tag,
                attr: oldEL.attr,
                text: (oldTT === TagType.Text ? oldEL.text : ""),
                type: oldTT,
                pos: oldPos,
            };

            const [newEL, newTT] = d.newELs[ditem.newIndex];
            const newPos = getPosition([newEL, newTT], parsedDOM);
            newItem = {
                tag: newEL.tag,
                attr: newEL.attr,
                text: (newTT === TagType.Text ? newEL.text : ""),
                type: newTT,
                pos: newPos,
            };

            ret.push({
                type: ditem.type,
                mostSeriousStatus: ditem.mostSeriousStatus,
                nochangeKeys: ditem.nochangeKeys,
                changedKeys: ditem.changedKeys,
                removedKeys: ditem.removedKeys,
                addedKeys: ditem.addedKeys,
                oldItem,
                newItem,
            });

        } else { util.assertNever(ditem); }
    }

    return ret;
};
