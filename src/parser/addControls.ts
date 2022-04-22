import { EL } from "../node/el";
import { initialEnv } from "./cst/env";
import $sentenceChildren from "./cst/rules/$sentenceChildren";


export const addControls = (elToBeModified: EL): EL => {
    if (["LawNum", "QuoteStruct"].indexOf(elToBeModified.tag) < 0) {
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
            elToBeModified.children = (elToBeModified.children as EL[]).map(addControls);
        }
    }
    return elToBeModified;
};

export default addControls;
