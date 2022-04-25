import { Container } from "../node/container";
import { EL } from "../node/el";
import { containerTags, getContainerType, ignoreAnalysisTag } from "./common";
import { isSentenceLike, SentenceEnv } from "../node/container/sentenceEnv";

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

    const extract = (el: EL, prevContainer: Container | null, prevParentELs: EL[]) => {

        if ((ignoreAnalysisTag as readonly string[]).includes(el.tag)) return;

        if (isSentenceLike(el)) {
            if (!prevContainer) throw new Error(`SentenceEnv: SentenceLike ${el.tag} has no container`);
            const sentenceEnv = new SentenceEnv({
                index: sentenceEnvs.length,
                el,
                lawType,
                parentELs: [...prevParentELs],
                container: prevContainer,
            });
            sentenceEnvs.push(sentenceEnv);
            sentenceEnvByEL.set(el, sentenceEnv);
            return;

        } else {
            const parentELs = [...prevParentELs, el];
            let container = prevContainer;

            if ((containerTags as readonly string[]).includes(el.tag)) {
                const type = getContainerType(el.tag);
                const containerID = `container-${containers.size}-tag_${el.tag}-type_${type}`;
                container = new Container({ containerID, el, type });
                if (prevContainer) prevContainer.addChild(container);
                containers.set(containerID, container);
                containersByEL.set(el, container);
                if (!rootContainer) rootContainer = container;
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

    if (!rootContainer) throw new Error();

    return { sentenceEnvs, sentenceEnvByEL, containers, containersByEL, rootContainer };
};

export default getSentenceEnvs;
