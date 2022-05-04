import { getContainerType } from "../../analyzer/common";
import { assertNever } from "../../util";
import { Container, ContainerType } from "../container";
import { SentenceEnv } from "../container/sentenceEnv";
import { EL } from "../el";
import { RelPos, ____LawRef, ____PF, ____Pointer } from "../el/controls";

export interface InternalLocatedInfo {
    type: "internal",
    fragments: {
        fragment: ____PF,
        containers: Container[],
    }[],
}

export interface ExternalLocatedInfo {
    type: "external",
    lawRef: ____LawRef,
    fqPrefixFragments: ____PF[],
}

export type LocatedInfo = InternalLocatedInfo | ExternalLocatedInfo;

export class PointerEnv {
    public directLawRef: ____LawRef | null = null;

    public namingParent: PointerEnv | null = null;
    public namingChildren: PointerEnv[] = [];

    public seriesPrev: PointerEnv | null = null;
    public seriesNext: PointerEnv | null = null;

    public located: LocatedInfo | null = null;

    public pointer: ____Pointer;
    public sentenceEnv: SentenceEnv;

    public constructor(options: {
        pointer: ____Pointer,
        sentenceEnv: SentenceEnv,
    }) {
        this.pointer = options.pointer;
        this.sentenceEnv = options.sentenceEnv;
    }

    public json() {
        return {
            pointer: this.pointer.json(true),
            located: (
                (this.located?.type === "internal")
                    ? {
                        ...this.located,
                        fragments: this.located.fragments.map(f => ({
                            // fragment: f.fragment.json(true),
                            text: f.fragment.text(),
                            containers: f.containers.map(c => c.containerID),
                        })),
                    }
                    : (this.located?.type === "external")
                        ? {
                            ...this.located,
                            lawRef: this.located.lawRef.text(),
                            fqPrefixFragments: this.located.fqPrefixFragments.map(f => f.json(true)),
                        }
                        : null
            ),
            directLawRef: this.directLawRef ? this.directLawRef?.text() : null,
            namingParent: this.namingParent ? this.namingParent.pointer.text() : null,
            namingChildren: this.namingChildren.map(c => c.pointer.text()),
            seriesPrev: this.seriesPrev ? this.seriesPrev.pointer.text() : null,
            seriesNext: this.seriesNext ? this.seriesNext.pointer.text() : null,
        };
    }

    public locate(force = false) {
        if (this.located && !force) return;

        const fragments = this.pointer.fragments();

        if ((fragments[0].attr.relPos === RelPos.SAME)) {
            // e.g.: "同条"

            if (!this.seriesPrev) {
                // console.warn(`No seriesPrev for ${this.pointer.text()}`);
                return;
            }

            this.seriesPrev.locate(force);
            const prev = this.seriesPrev.located;
            if (!prev) {
                // console.warn(`Not located ${this.seriesPrev.pointer.text()}`);
                return;
            } else if (prev.type === "external") {
                const fqDupIndex = prev.fqPrefixFragments.findIndex(f => f.attr.targetType === fragments[0].attr.targetType);
                const fqPrefixFragments = (fqDupIndex < 0) ? prev.fqPrefixFragments : prev.fqPrefixFragments.slice(0, fqDupIndex);
                this.located = {
                    type: "external",
                    lawRef: prev.lawRef,
                    fqPrefixFragments,
                };
            } else if (prev.type === "internal") {
                const container = (
                    prev.fragments.slice().reverse()
                        .find(f => f.containers.length > 0)
                        ?.containers.slice(-1)[0]
                        ?.thisOrClosest(c => c.el.tag === fragments[0].attr.targetType)
                ) ?? null;
                if (!container) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }
                this.located = {
                    type: "internal",
                    fragments: locateContainersForFragments([container], fragments),
                };
            }
            else { throw assertNever(prev); }

        } else if (fragments[0].attr.relPos === RelPos.HERE) {
            // e.g.: "この条"

            const scopeContainer = this.sentenceEnv.container
                .thisOrClosest(c => c.el.tag === fragments[0].attr.targetType);

            if (!scopeContainer) {
                // console.warn(`Not located ${this.pointer.text()}`);
                return;
            }

            this.located = {
                type: "internal",
                fragments: locateContainersForFragments([scopeContainer], fragments),
            };

        } else if (fragments[0].attr.relPos === RelPos.PREV) {
            // e.g.: "前条", "前二号", "前各号"

            const scopeContainer = this.sentenceEnv.container
                .thisOrClosest(c => c.el.tag === fragments[0].attr.targetType);

            if (!scopeContainer) {
                // console.warn(`Not located ${this.pointer.text()}`);
                return;
            }

            let count = fragments[0].attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(fragments[0].attr.count);
            if (count > 0) {
                // e.g.: "前二号", "前各号"

                const containers: Container[] = [];
                for (const prevContainer of scopeContainer.prevAll(c => c.el.tag === fragments[0].attr.targetType)) {
                    containers.unshift(prevContainer);
                    count--;
                    if (count <= 0) break;
                }

                if (containers.length <= 0) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }

                this.located = {
                    type: "internal",
                    fragments: locateContainersForFragments(containers, fragments),
                };

            } else {
                // e.g.: "前条"

                const container = (
                    (getContainerType(fragments[0].attr.targetType) === ContainerType.ARTICLES)
                        ? scopeContainer.prev(c => c.el.tag === fragments[0].attr.targetType)
                        : scopeContainer.prevSub(c => c.el.tag === fragments[0].attr.targetType)
                );

                if (!container) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }

                this.located = {
                    type: "internal",
                    fragments: locateContainersForFragments([container], fragments),
                };
            }

        } else if (fragments[0].attr.relPos === RelPos.NEXT) {
            // e.g.: "次条"

            const scopeContainer = this.sentenceEnv.container
                .thisOrClosest(c => c.el.tag === fragments[0].attr.targetType);
            if (!scopeContainer) {
                // console.warn(`Not located ${this.pointer.text()}`);
                return;
            }

            let count = fragments[0].attr.count === "all" ? Number.MAX_SAFE_INTEGER : Number(fragments[0].attr.count);
            if (count > 0) {
                const containers: Container[] = [];
                for (const nextContainer of scopeContainer.nextAll(c => c.el.tag === fragments[0].attr.targetType)) {
                    containers.push(nextContainer);
                    count--;
                    if (count <= 0) break;
                }

                if (containers.length <= 0) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }

                this.located = {
                    type: "internal",
                    fragments: locateContainersForFragments(containers, fragments),
                };

            } else {
                const container = (
                    (getContainerType(fragments[0].attr.targetType) === ContainerType.ARTICLES)
                        ? scopeContainer.next(c => c.el.tag === fragments[0].attr.targetType)
                        : scopeContainer.nextSub(c => c.el.tag === fragments[0].attr.targetType)
                );

                if (!container) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }

                this.located = {
                    type: "internal",
                    fragments: locateContainersForFragments([container], fragments),
                };
            }

        } else if (fragments[0].attr.relPos === RelPos.NAMED) {
            // e.g.: "第二条", "第二項"

            if (getContainerType(fragments[0].attr.targetType) === ContainerType.TOPLEVEL) {
                // e.g.: "附則", "別表第二"

                if (this.directLawRef) {
                    // e.g. "電波法別表第一"
                    this.located = {
                        type: "external",
                        lawRef: this.directLawRef,
                        fqPrefixFragments: [],
                    };

                } else {
                    // e.g. "別表第一"

                    const container = this.sentenceEnv.container.findAncestorChildrenSub(c => {
                        if (c.el.tag !== fragments[0].attr.targetType) return false;
                        const titleEl = c.el.children.find(el =>
                            el instanceof EL && (el.tag === `${c.el.tag}Title` || el.tag === `${c.el.tag}Label`)) as EL | undefined;
                        return (new RegExp(`^${fragments[0].attr.name}(?:[(（]|\\s|$)`)).exec(titleEl?.text() ?? "") !== null;
                    });

                    if (!container) {
                        // console.warn(`Not located ${this.pointer.text()}`);
                        return;
                    }

                    this.located = {
                        type: "internal",
                        fragments: locateContainersForFragments([container], fragments),
                    };

                }

            } else if (fragments[0].attr.targetType === "SUBITEM") {
                // e.g. "イ"

                // Assuming no directLawRef

                let located = false;

                if (this.namingParent) this.namingParent.locate(force);
                const prev = this.namingParent?.located;

                if (prev) {

                    if (prev.type === "external") {
                        const prevFQPrefixFragments = prev.fqPrefixFragments;
                        const fqDupIndex = prevFQPrefixFragments.findIndex(f => f.attr.targetType === fragments[0].attr.targetType);
                        const fqPrefixFragments = (fqDupIndex < 0) ? prevFQPrefixFragments : prevFQPrefixFragments.slice(0, fqDupIndex);
                        this.located = {
                            type: "external",
                            lawRef: prev.lawRef,
                            fqPrefixFragments,
                        };
                        located = true;

                    } else if (prev.type === "internal") {
                        const scopeContainer = (
                            prev.fragments.slice().reverse()
                                .find(f => f.containers.length > 0)
                                ?.containers.slice(-1)[0]
                        ) ?? null;

                        const container = scopeContainer && (
                            scopeContainer.children.find(c => c.name === fragments[0].attr.name)
                            ?? scopeContainer.findAncestorChildrenSub(c => c.name === fragments[0].attr.name)
                            ?? null
                        );

                        if (!container) {
                            // console.warn(`Not located ${this.pointer.text()}`);
                            return;
                        }
                        this.located = {
                            type: "internal",
                            fragments: locateContainersForFragments([container], fragments),
                        };
                    }

                } else {
                    const scopeContainer = this.sentenceEnv.container;

                    const container = (
                        scopeContainer.children.find(c => c.name === fragments[0].attr.name)
                        ?? scopeContainer.findAncestorChildrenSub(c => c.name === fragments[0].attr.name)
                        ?? null
                    );

                    if (!container) {
                        // console.warn(`Not located ${this.pointer.text()}`);
                        return;
                    }
                    this.located = {
                        type: "internal",
                        fragments: locateContainersForFragments([container], fragments),
                    };

                }

                if (!located) {
                    // console.warn(`Not located ${this.pointer.text()}`);
                    return;
                }

            } else {

                if (this.directLawRef) {
                    // e.g. "行政手続法第二条"
                    this.located = {
                        type: "external",
                        lawRef: this.directLawRef,
                        fqPrefixFragments: [],
                    };

                } else {
                    // e.g. "第二条"
                    let located = false;

                    if (this.namingParent) this.namingParent.locate(force);
                    const prev = this.namingParent?.located;

                    if (prev?.type === "external") {
                        // e.g. "行政手続法第二条" -> "第三条"

                        const prevFQPrefixFragments = prev.fqPrefixFragments;
                        const fqDupIndex = prevFQPrefixFragments.findIndex(f => f.attr.targetType === fragments[0].attr.targetType);
                        const fqPrefixFragments = (fqDupIndex < 0) ? prevFQPrefixFragments : prevFQPrefixFragments.slice(0, fqDupIndex);
                        this.located = {
                            type: "external",
                            lawRef: prev.lawRef,
                            fqPrefixFragments,
                        };
                        located = true;

                    } else {

                        if (prev?.type === "internal") {
                            // e.g. "第二条第二項" -> "第三項"

                            const scopeContainer = (
                                prev.fragments.slice().reverse()
                                    .find(f => f.containers.length > 0)
                                    ?.containers.slice(-1)[0]
                            ) ?? null;

                            const func = (c: Container) => (
                                (c.el.tag === fragments[0].attr.targetType)
                                && ((c.num || null) === fragments[0].attr.num)
                            );
                            const container = scopeContainer && (
                                scopeContainer.children.find(func)
                                ?? scopeContainer.findAncestorChildrenSub(func)
                                ?? null
                            );

                            if (container) {
                                this.located = {
                                    type: "internal",
                                    fragments: locateContainersForFragments([container], fragments),
                                };
                                located = true;
                            }
                        }

                        if (!located) {
                            // e.g. "第三項"

                            const scopeContainer = this.sentenceEnv.container;

                            const func = (c: Container) => (
                                (c.el.tag === fragments[0].attr.targetType)
                                && ((c.num || null) === fragments[0].attr.num)
                            );
                            const container = (
                                scopeContainer.children.find(func)
                                ?? scopeContainer.findAncestorChildrenSub(func)
                                ?? null
                            );

                            if (!container) {
                                // console.warn(`Not located ${this.pointer.text()}`);
                                return;
                            }
                            this.located = {
                                type: "internal",
                                fragments: locateContainersForFragments([container], fragments),
                            };
                            located = true;
                        }

                    }

                    if (!located) {
                        // console.warn(`Not located ${this.pointer.text()}`);
                        return;
                    }
                }
            }
        }
        else { throw assertNever(fragments[0].attr.relPos); }
    }
}


const locateContainerFromParent = (parentContainer: Container, fragment: ____PF) => {
    return parentContainer.find(
        c =>
            (
                (
                    (c.el.tag === fragment.attr.targetType)
                    || (
                        (fragment.attr.targetType === "SUBITEM")
                        && (/^Subitem\d+$/.exec(c.el.tag) !== null)
                    )
                )
                && ((c.num ?? null) === fragment.attr.num)
            )
            || (
                (fragment.attr.targetType === "PROVISO")
                && (c.el.tag === "Sentence")
                && (c.el.attr.Function === "proviso")
            ),
    );
};


const locateContainersForFragments = (
    headFragmentContainers: Container[],
    fragments: ____PF[],
): {
    fragment: ____PF,
    containers: Container[],
}[] => {
    const locatedContainersForFragments: {
        fragment: ____PF,
        containers: Container[],
    }[] = [];

    if (fragments.length === 1) {
        locatedContainersForFragments.push({ fragment: fragments[0], containers: headFragmentContainers });

    } else {
        let parentContainer = headFragmentContainers[headFragmentContainers.length - 1];
        locatedContainersForFragments.push({ fragment: fragments[0], containers: [parentContainer] });

        for (const fragment of fragments.slice(1)) {
            const container = locateContainerFromParent(parentContainer, fragment);

            if (container) {
                locatedContainersForFragments.push({ fragment, containers: [container] });
                parentContainer = container;
            } else {
                break;
            }
        }
    }

    return locatedContainersForFragments;

};
