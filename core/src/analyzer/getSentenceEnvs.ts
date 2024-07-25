import { containerTags, Container, ContainerType } from "../node/container";
import type { EL } from "../node/el";
import { isIgnoreAnalysis } from "./common";
import { isSentenceLike, SentenceEnv } from "../node/container/sentenceEnv";
import * as std from "../law/std";
import { parseNamedNum } from "../law/num";

export interface SentenceEnvsStruct {
    sentenceEnvs: SentenceEnv[];
    sentenceEnvByEL: Map<EL, SentenceEnv>;
    containers: Map<string, Container>;
    containersByEL: Map<EL, Container>;
    rootContainer: Container;
}

export const getSentenceEnvs = (el: EL): SentenceEnvsStruct => {

    const sentenceEnvs: SentenceEnv[] = [];
    const sentenceEnvByEL: Map<EL, SentenceEnv> = new Map();
    const containers: Map<string, Container> = new Map();
    const containersByEL: Map<EL, Container> = new Map();

    let rootContainer: Container | null = null;
    const lawType = el.attr.LawType ?? "";

    const dummyRootContainer = new Container({
        containerID: "container-dummy-root",
        type: ContainerType.ROOT,
        el,
        name: null,
        num: null,
        allSentenceEnvs: sentenceEnvs,
    });

    const extract = (el: EL, prevContainer: Container | null, prevParentELs: EL[]) => {

        if (isIgnoreAnalysis(el)) return;

        if (isSentenceLike(el) && !(containerTags as readonly string[]).includes(el.tag)) {
            const container = prevContainer ?? rootContainer ?? dummyRootContainer;
            if (!rootContainer) rootContainer = container;
            const sentenceEnv = new SentenceEnv({
                index: sentenceEnvs.length,
                elToBeModified: el,
                lawType,
                parentELs: [...prevParentELs],
                container,
            });
            sentenceEnvs.push(sentenceEnv);
            sentenceEnvByEL.set(el, sentenceEnv);
            return;

        } else {
            const parentELs = [...prevParentELs, el];
            let container = prevContainer;

            if ((containerTags as readonly string[]).includes(el.tag)) {
                const name = (
                    (el.children.find(c => (
                        std.isArticleTitle(c)
                        || std.isParagraphItemTitle(c)
                        || std.isArticleGroupTitle(c)
                        || std.isAppdxItemTitle(c)
                        || std.isSupplProvisionLabel(c)
                        || std.isSupplProvisionAppdxItemTitle(c)
                    )) as EL | undefined)?.text()
                    ?? null
                );
                const num = (
                    (name && parseNamedNum(name))
                    || ((std.isParagraph(el) && "1") || null)
                );
                const containerID = prevContainer ? `${prevContainer.containerID}-${el.tag}[${prevContainer.children.filter(c => c.el.tag === el.tag).length + 1}]${num ? "[num=" + num + "]" : ""}` : `container-${el.tag}`;
                container = new Container({
                    el,
                    name,
                    num,
                    containerID,
                    allSentenceEnvs: sentenceEnvs,
                });
                if (prevContainer) prevContainer.addChild(container);
                containers.set(container.containerID, container);
                containersByEL.set(el, container);
                if (!rootContainer) rootContainer = container;

                if (isSentenceLike(el)) {
                    const sentenceEnv = new SentenceEnv({
                        index: sentenceEnvs.length,
                        elToBeModified: el,
                        lawType,
                        parentELs: [...prevParentELs],
                        container,
                    });
                    sentenceEnvs.push(sentenceEnv);
                    sentenceEnvByEL.set(el, sentenceEnv);
                }
            }

            const startSentenceIndex = sentenceEnvs.length;
            for (const child of el.children) {
                if (typeof child === "string") continue;
                extract(child, container, parentELs);
            }
            const endSpanIndex = sentenceEnvs.length; // half open

            if (container) container.sentenceRange = [startSentenceIndex, endSpanIndex];
        }
    };

    extract(el, null, []);

    dummyRootContainer.sentenceRange = [0, sentenceEnvs.length];

    if (!rootContainer) throw new Error();

    return { sentenceEnvs, sentenceEnvByEL, containers, containersByEL, rootContainer };
};

export default getSentenceEnvs;
