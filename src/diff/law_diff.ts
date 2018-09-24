import * as util from "../util"
import { isString } from "util";
import { EditTable, compare } from "./edit_table";

export enum TagType {
    Open = "Open",
    Close = "Close",
    Empty = "Empty",
    Text = "Text",
}

export interface LawDiffResult<T> {
    mostSeriousStatus: ProblemStatus;
    items: LawDiffResultItem<T>[];
    oldELs: [ComparableEL, TagType][];
    newELs: [ComparableEL, TagType][];
}

export type LawDiffResultItem<T> = LawDiffElementMismatch<T> | LawDiffElementChange<T> | LawDiffNoDiff<T>
export enum LawDiffType {
    ElementMismatch,
    ElementChange,
    NoDiff,
}

export interface LawDiffElementMismatch<T> {
    type: LawDiffType.ElementMismatch;
    diffTable: DiffTable<T>;
}

export interface LawDiffElementChange<T> {
    type: LawDiffType.ElementChange;
    mostSeriousStatus: ProblemStatus;
    diffTable: DiffTable<T>;
    nochangeKeys: string[];
    changedKeys: [string, ProblemStatus][];
    removedKeys: [string, ProblemStatus][];
    addedKeys: [string, ProblemStatus][];
    oldIndex: number;
    newIndex: number;
}

export interface LawDiffNoDiff<T> {
    type: LawDiffType.NoDiff;
    diffTable: DiffTable<T>;
}

export enum ProblemStatus {
    Error = 2,
    Warning = 1,
    NoProblem = 0,
}

export enum DiffStatus {
    Add = "Add",
    Remove = "Remove",
    Change = "Change",
    NoChange = "NoChange",
}

type DiffTable<T> = DiffTableRow<T>[];
type DiffTableRow<T> = DiffAddRow<T> | DiffRemoveRow<T> | DiffChangeRow<T> | DiffNoChangeRow<T>;
interface DiffAddRow<T> {
    status: DiffStatus.Add,
    oldItem: null,
    newItem: DiffTableItem<T>,
};
interface DiffRemoveRow<T> {
    status: DiffStatus.Remove,
    oldItem: DiffTableItem<T>,
    newItem: null,
};
interface DiffChangeRow<T> {
    status: DiffStatus.Change,
    oldItem: DiffTableItem<T>,
    newItem: DiffTableItem<T>,
};
interface DiffNoChangeRow<T> {
    status: DiffStatus.NoChange,
    oldItem: DiffTableItem<T>,
    newItem: DiffTableItem<T>,
};
type DiffTableItem<T> = {
    index: number,
    value: T,
};

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
]);

export class ComparableEL implements util.JsonEL {
    tag: string = "";
    attr: { [key: string]: string | undefined } = {};
    children: ComparableEL[] = [];
    index: number;
    closeIndex: number;
    nextIndex: number;
    parent?: ComparableEL;
    _text: string | null = null;

    constructor(el: util.JsonEL | string, parent?: ComparableEL, index = 0) {
        this.index = index;
        this.parent = parent;
        this.nextIndex = index + 1;
        if (isString(el)) {
            this.tag = "";
            this.attr = {};
            this._text = el;
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
        if (this._text === null) {
            this._text = this.children.map(child => child instanceof ComparableEL ? child.text : child).join("／");
        }
        return this._text;
    }

    *textList(): IterableIterator<[number, string, ComparableEL]> {
        if (this.tag === "") {
            yield [this.index, this.text, this];
        } else {
            for (const child of this.children) {
                yield* child.textList();
            }
        }
    }

    *allList(): IterableIterator<[ComparableEL, TagType]> {
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

    getXPath() {
        if (this.parent) {
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
        } else {
            return `/${this.tag}`;
        }
    }
}

export function lawDiff(oldJson: util.JsonEL, newJson: util.JsonEL, noProblemAsNoDiff: boolean = false) {

    const oldEL = new ComparableEL(oldJson);
    const oldELs = [...oldEL.allList()];
    if (!oldELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const newEL = new ComparableEL(newJson);
    const newELs = [...newEL.allList()];
    if (!newELs.every(([el, tt], i) => tt === TagType.Close ? el.closeIndex === i : el.index === i)) throw new Error("never");

    const ret: LawDiffResult<string> = {
        mostSeriousStatus: ProblemStatus.NoProblem,
        items: [],
        oldELs: oldELs,
        newELs: newELs,
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
                return `${el.text}`;

            } else { throw util.assertNever(tt) };
        });
    });

    const textEdit = tuneEditTable(compare(oldTexts, newTexts), oldELs, newELs);
    const diff = collapseChange(textEdit);

    let noDiffTable: DiffTable<string> = [];

    for (const [di, dRow] of diff.entries()) {
        if (dRow.status === DiffStatus.NoChange) {
            const oldIndex = dRow.oldItem.index;
            const newIndex = dRow.newItem.index;

            const [oldEL, oldTT] = oldELs[oldIndex];
            const [newEL, newTT] = newELs[newIndex];

            if (oldTT === TagType.Open && newTT === TagType.Open) {

                const oldKeys = Object.keys(oldEL.attr);
                const newKeys = Object.keys(newEL.attr);

                const nochangeKeys: string[] = [];
                const changedKeys: [string, ProblemStatus][] = [];
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
                        changedKeys.push([key, ProblemStatus.Error]);
                    } else {
                        nochangeKeys.push(key);
                    }
                }

                const removedKeys: [string, ProblemStatus][] = [];
                for (const key of oldKeys.filter(x => !newKeys.includes(x))) {
                    if (defaultAttr.get(key) === oldEL.attr[key]) {
                        removedKeys.push([key, ProblemStatus.NoProblem]);
                    } else {
                        removedKeys.push([key, ProblemStatus.Error]);
                    }
                }

                const addedKeys: [string, ProblemStatus][] = [];
                for (const key of newKeys.filter(x => !oldKeys.includes(x))) {
                    if (defaultAttr.get(key) === newEL.attr[key]) {
                        addedKeys.push([key, ProblemStatus.NoProblem]);
                    } else {
                        addedKeys.push([key, ProblemStatus.Error]);
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

                    if (noDiffTable.length) {
                        ret.items.push({
                            type: LawDiffType.NoDiff,
                            diffTable: noDiffTable,
                        });
                        noDiffTable = [];
                    }

                    ret.items.push({
                        type: LawDiffType.ElementChange,
                        mostSeriousStatus: elementMostSeriousStatus,
                        diffTable: [dRow],
                        nochangeKeys: nochangeKeys,
                        changedKeys: changedKeys,
                        removedKeys: removedKeys,
                        addedKeys: addedKeys,
                        oldIndex: oldIndex,
                        newIndex: newIndex,
                    });
                    ret.mostSeriousStatus = Math.max(ret.mostSeriousStatus, elementMostSeriousStatus);
                } else {
                    noDiffTable.push(dRow);
                }

            } else {
                noDiffTable.push(dRow);
            }

        } else if (dRow.status === DiffStatus.Change) {

            if (noDiffTable.length) {
                ret.items.push({
                    type: LawDiffType.NoDiff,
                    diffTable: noDiffTable,
                });
                noDiffTable = [];
            }

            ret.items.push({
                type: LawDiffType.ElementMismatch,
                diffTable: [dRow],
            });
            ret.mostSeriousStatus = ProblemStatus.Error;

        } else if (dRow.status === DiffStatus.Add) {

            if (noDiffTable.length) {
                ret.items.push({
                    type: LawDiffType.NoDiff,
                    diffTable: noDiffTable,
                });
                noDiffTable = [];
            }

            ret.items.push({
                type: LawDiffType.ElementMismatch,
                diffTable: [dRow],
            });
            ret.mostSeriousStatus = ProblemStatus.Error;

        } else if (dRow.status === DiffStatus.Remove) {

            if (noDiffTable.length) {
                ret.items.push({
                    type: LawDiffType.NoDiff,
                    diffTable: noDiffTable,
                });
                noDiffTable = [];
            }

            ret.items.push({
                type: LawDiffType.ElementMismatch,
                diffTable: [dRow],
            });
            ret.mostSeriousStatus = ProblemStatus.Error;

        } else { throw util.assertNever(dRow) };
    }

    return ret;

}

function tuneEditTable<T>(table: EditTable<T>, oldELs: [ComparableEL, TagType][], newELs: [ComparableEL, TagType][]) {
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
                const [moveItem, /**/] = table[endPos + 1 - count];
                if (!moveItem) break;
                const [moveIndex, /**/] = moveItem;
                const [moveEL, moveTT] = oldELs[moveIndex];
                if (moveTT !== TagType.Open) break;

                const [oldItem, newItem] = table[startPos - count];
                if (!oldItem || !newItem) break;
                const [newIndex, /**/] = newItem;
                const [newEL, newTT] = newELs[newIndex];
                if (newTT !== TagType.Open) break;

                if (moveEL.tag !== newEL.tag) break;
                moveCount = count;
            }
            for (let pos = nextEmitPos; pos < startPos - moveCount; pos++) {
                ret.push(table[pos]);
            }
            for (let pos = startPos - moveCount; pos < startPos; pos++) {
                const [oldItem, /**/] = table[pos];
                if (!oldItem) throw new Error("never");
                ret.push([oldItem, null]);
            }
            for (let pos = startPos; pos < endPos + 1 - moveCount; pos++) {
                ret.push(table[pos]);
            }
            for (let pos = endPos + 1 - moveCount; pos <= endPos; pos++) {
                const [oldItem, /**/] = table[pos];
                const [/**/, newItem] = table[startPos - (endPos + 1 - pos)];
                if (!oldItem || !newItem) throw new Error("never");
                ret.push([oldItem, newItem]);
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
}

function collapseChange<T>(diff: EditTable<T>) {
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
                status = DiffStatus.Change
            } else {
                status = DiffStatus.Add;
            }
        } else if (oldItem && !newItem) {
            if (status === DiffStatus.Add || status === DiffStatus.Change) {
                status = DiffStatus.Change
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
            const oldItems: DiffTableItem<T>[] = [];
            const newItems: DiffTableItem<T>[] = [];
            for (let pos = startPos; pos <= endPos; pos++) {
                const [oldItem, newItem] = diff[pos];
                if (oldItem) oldItems.push({ index: oldItem[0], value: oldItem[1] });
                if (newItem) newItems.push({ index: newItem[0], value: newItem[1] });
            }
            const maxLength = Math.max(oldItems.length, newItems.length);
            for (let i = 0; i < maxLength; i++) {
                ret.push({
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
}

export function collapseNoChange(diff: EditTable<string>) {
    const ret: EditTable<string> = [];
    let startPos: number | null = null;
    let endPos: number | null = null;
    for (const [pos, [oldItem, newItem]] of diff.entries()) {
        if (startPos === null) {
            if (!oldItem || !newItem) {
                ret.push(diff[pos]);
                continue;
            }
            startPos = pos;
        }

        if (!oldItem || !newItem) {
            endPos = pos - 1;
        } else if (pos === diff.length - 1) {
            endPos = pos;
        }

        if (endPos !== null && startPos !== null) {
            for (let pos = startPos; pos <= endPos; pos++) {
                if (pos <= startPos + 1 || endPos - 1 <= pos) {
                    ret.push(diff[pos]);
                } else if (pos == startPos + 2 && pos <= endPos - 2) {
                    ret.push([[-1, "："], [-1, "："]]);
                }
            }
            startPos = null;
            endPos = null;
        }
        if (!oldItem || !newItem) {
            ret.push(diff[pos]);
        }
    }
    return ret;
}
