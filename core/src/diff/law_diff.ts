import * as xpath from "xpath";
import { JsonEL } from "../node/el/jsonEL";
import * as util from "../util";
import { compare, EditTable } from "./edit_table";

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
    const oldELs = [...oldRoot.allList()];
    if (!oldELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const newRoot = new ComparableEL(newJson);
    const newELs = [...newRoot.allList()];
    if (!newELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const ret: LawDiffResult<string> = {
        mostSeriousStatus: ProblemStatus.NoProblem,
        items: [],
        oldRoot,
        newRoot,
        oldELs,
        newELs,
    };


    const [oldTexts, newTexts] = [oldELs, newELs].map(els => {
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
    });

    const textEdit = tuneEditTable(compare(oldTexts, newTexts), oldELs, newELs);
    const diff = collapseChange(textEdit);

    let noDiffTable: DiffTable<string> = [];

    const emitNoDiff = () => {
        if (noDiffTable.length) {
            ret.items.push({
                type: LawDiffType.NoDiff,
                mostSeriousStatus: ProblemStatus.NoProblem,
                diffTable: noDiffTable,
            });
            noDiffTable = [];
        }
    };

    const fragmentELsList: FragmentElements[] = [];

    for (const dRow of diff) {
        const oldIndex = dRow.oldItem && dRow.oldItem.index;
        const newIndex = dRow.newItem && dRow.newItem.index;

        const [oldEL /**/] = oldIndex ? oldELs[oldIndex] : [null, null];
        const [newEL /**/] = newIndex ? newELs[newIndex] : [null, null];

        const isFragment = fragmentELsList.some(els => {
            const oldIsFragment = !oldEL || 0 <= els.oldELs.indexOf(oldEL);
            const newIsFragment = !newEL || 0 <= els.newELs.indexOf(newEL);
            return oldIsFragment && newIsFragment;
        });

        if (dRow.status !== DiffStatus.NoChange && isFragment) {
            if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                noDiffTable.push(dRow);

            } else {
                emitNoDiff();
                ret.items.push({
                    type: LawDiffType.ElementMismatch,
                    mostSeriousStatus: ProblemStatus.Warning,
                    diffTable: [dRow],
                });
            }
            // ret.mostSeriousStatus = Math.max(ret.mostSeriousStatus, ProblemStatus.Warning);

        } else if (dRow.status === DiffStatus.NoChange) {
            const r = processNoChange(dRow, oldELs, newELs, lawDiffMode === LawDiffMode.NoProblemAsNoDiff || lawDiffMode === LawDiffMode.WarningAsNoDiff);
            if (r && (
                (lawDiffMode === LawDiffMode.NoProblemAsNoDiff
                    && ProblemStatus.NoProblem < r.mostSeriousStatus) ||
                (lawDiffMode === LawDiffMode.WarningAsNoDiff
                    && ProblemStatus.Warning < r.mostSeriousStatus) ||
                (lawDiffMode === LawDiffMode.DiffAll)
            )) {
                emitNoDiff();
                ret.items.push(r);
                // ret.mostSeriousStatus = Math.max(ret.mostSeriousStatus, r.mostSeriousStatus);
            } else {
                noDiffTable.push(dRow);
            }

        } else if (dRow.status === DiffStatus.Change) {
            const r = detectFragments(dRow, oldELs, newELs);

            if (r) {
                fragmentELsList.push(r);

                if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                    noDiffTable.push(dRow);
                } else {
                    emitNoDiff();
                    ret.items.push({
                        type: LawDiffType.ElementMismatch,
                        mostSeriousStatus: ProblemStatus.Warning,
                        diffTable: [dRow],
                    });
                }

                if (dRow.newItem && (r.newELs[0].index < dRow.newItem.index)) {
                    const maxDI = dRow.newItem.index - r.newELs[0].index;
                    for (let i = ret.items.length - 1; i >= (ret.items.length - 1 - maxDI); i--) {
                        if (ret.items[i].type === LawDiffType.NoDiff) continue;
                        if (
                            (ret.items[i].type === LawDiffType.ElementMismatch) &&
                            (ret.items[i].mostSeriousStatus > ProblemStatus.Warning) &&
                            (ret.items[i].diffTable[ret.items[i].diffTable.length - 1].newItem?.index === r.newELs[0].index)
                        ) {
                            if (lawDiffMode === LawDiffMode.WarningAsNoDiff) {
                                ret.items[i].type = LawDiffType.NoDiff;
                                ret.items[i].mostSeriousStatus = ProblemStatus.NoProblem;
                            } else {
                                ret.items[i].mostSeriousStatus = ProblemStatus.Warning;
                            }
                        }
                        break;
                    }
                }

                // ret.mostSeriousStatus = Math.max(ret.mostSeriousStatus, ProblemStatus.Warning);

            } else {
                emitNoDiff();
                ret.items.push({
                    type: LawDiffType.ElementMismatch,
                    mostSeriousStatus: ProblemStatus.Error,
                    diffTable: [dRow],
                });
                // ret.mostSeriousStatus = ProblemStatus.Error;

            }

        } else if (dRow.status === DiffStatus.Add) {

            emitNoDiff();

            ret.items.push({
                type: LawDiffType.ElementMismatch,
                mostSeriousStatus: ProblemStatus.Error,
                diffTable: [dRow],
            });
            // ret.mostSeriousStatus = ProblemStatus.Error;

        } else if (dRow.status === DiffStatus.Remove) {

            emitNoDiff();

            ret.items.push({
                type: LawDiffType.ElementMismatch,
                mostSeriousStatus: ProblemStatus.Error,
                diffTable: [dRow],
            });
            // ret.mostSeriousStatus = ProblemStatus.Error;

        } else { throw util.assertNever(dRow); }
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

interface FragmentElements {
    oldELs: ComparableEL[];
    newELs: ComparableEL[];
}

const detectFragments = (dRow: DiffTableRow<string>, oldELs: Array<[ComparableEL, TagType]>, newELs: Array<[ComparableEL, TagType]>): FragmentElements | null => {
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

            {
                // Join Sentence elements

                const oldSentence = oldEL.parent;
                const newSentence = newEL.parent;

                const [oldSentences, newSentences] = [oldSentence, newSentence].map(sentence => {
                    const p = sentence.parent;
                    if (!p) return [sentence];
                    const ret: ComparableEL[] = [];
                    for (let i = p.children.indexOf(sentence); i < p.children.length; i++) {
                        if (p.children[i].tag === sentence.tag) ret.push(p.children[i]);
                        else break;
                    }
                    return ret;
                });

                const oldJoinText = oldSentences.map(el => el.text).join("");
                const newJoinText = newSentences.map(el => el.text).join("");
                if (oldJoinText === newJoinText) {
                    return {
                        oldELs: ([] as ComparableEL[])
                            .concat(...oldSentences.map(el => Array.from(el.allList()).map(([e ]) => e))),
                        newELs: ([] as ComparableEL[])
                            .concat(...newSentences.map(el => Array.from(el.allList()).map(([e ]) => e))),
                    };
                }
            }

            if (
                oldEL.parent.parent && newEL.parent.parent &&
                oldEL.parent.parent.tag === "Column" && newEL.parent.parent.tag === "Column" &&
                oldEL.parent.parent.children.every(el => el.tag === "Sentence") &&
                newEL.parent.parent.children.every(el => el.tag === "Sentence")
            ) {
                // Join Column elements

                const oldColumn = oldEL.parent.parent;
                const newColumn = newEL.parent.parent;

                const [oldColumns, newColumns] = [oldColumn, newColumn].map(column => {
                    const p = column.parent;
                    if (!p) return [column];
                    const ret: ComparableEL[] = [];
                    for (let i = p.children.indexOf(column); i < p.children.length; i++) {
                        if (p.children[i].tag === column.tag) ret.push(p.children[i]);
                        else break;
                    }
                    return ret;
                });
                const oldJoinText = oldColumns.map(el => el.children.map(ch => ch.text).join("")).join("　");
                const newJoinText = newColumns.map(el => el.children.map(ch => ch.text).join("")).join("　");
                if (oldJoinText === newJoinText) {
                    return {
                        oldELs: ([] as ComparableEL[])
                            .concat(...oldColumns.map(el => Array.from(el.allList()).map(([e ]) => e))),
                        newELs: ([] as ComparableEL[])
                            .concat(...newColumns.map(el => Array.from(el.allList()).map(([e ]) => e))),
                    };
                }
            }

            if (
                newEL.parent.parent &&
                newEL.parent.parent.tag === "Column" &&
                newEL.parent.parent.children.every(el => el.tag === "Sentence")
            ) {
                // Join old Sentence elements and new Column elements

                const oldSentence = oldEL.parent;

                const [oldSentences] = [oldSentence].map(sentence => {
                    const p = sentence.parent;
                    if (!p) return [sentence];
                    const ret: ComparableEL[] = [];
                    for (let i = p.children.indexOf(sentence); i < p.children.length; i++) {
                        if (p.children[i].tag === sentence.tag) ret.push(p.children[i]);
                        else break;
                    }
                    return ret;
                });

                const newColumn = newEL.parent.parent;

                const [newColumns] = [newColumn].map(column => {
                    const p = column.parent;
                    if (!p) return [column];
                    const ret: ComparableEL[] = [];
                    for (let i = p.children.indexOf(column); i < p.children.length; i++) {
                        if (p.children[i].tag === column.tag) ret.push(p.children[i]);
                        else break;
                    }
                    return ret;
                });

                const oldJoinText = oldSentences.map(el => el.text).join("");
                const newJoinText = newColumns.map(el => el.children.map(ch => ch.text).join("")).join("　");

                if (oldJoinText === newJoinText) {
                    return {
                        oldELs: ([] as ComparableEL[])
                            .concat(...oldSentences.map(el => Array.from(el.allList()).map(([e ]) => e))),
                        newELs: ([] as ComparableEL[])
                            .concat(...newColumns.map(el => Array.from(el.allList()).map(([e ]) => e))),
                    };
                }
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
    }
    return null;
};

const tuneEditTable = <T>(table: EditTable<T>, oldELs: Array<[ComparableEL, TagType]>, newELs: Array<[ComparableEL, TagType]>) => {
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
