import * as std from "../law/std";
import { __Text } from "../node/el/controls";
import { initialEnv } from "./cst/env";
import $sentenceChildren from "./cst/rules/$sentenceChildren";

export const addSentenceChildrenControls = <TEL extends std.StdEL | std.__EL>(elToBeModified: TEL): TEL => {
    if (["LawNum", "QuoteStruct"].includes(elToBeModified.tag)) {
        //
    } else if (["ArticleTitle", ...std.paragraphItemTitleTags, ...std.appdxItemTitleTags, ...std.supplProvisionAppdxItemTitleTags].includes(elToBeModified.tag)) {
        elToBeModified.children = [new __Text(elToBeModified.text(), elToBeModified.range)];
    } else {
        const isMixed = elToBeModified.children.some(child => typeof child === "string" || child instanceof String);
        if (isMixed) {
            const result = $sentenceChildren.match(0, elToBeModified.innerXML().replace(/\r|\n/, ""), initialEnv({}));
            if (result.ok) {
                elToBeModified.children = result.value.value;
            } else {
                const message = `addControls: Error: ${elToBeModified.innerXML()}`;
                throw new Error(message);
            }
        } else {
            elToBeModified.children = (elToBeModified.children as (std.StdEL | std.__EL)[]).map(addSentenceChildrenControls);
        }
    }
    return elToBeModified;
};

export default addSentenceChildrenControls;
