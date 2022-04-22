import { EL } from "../node/el";
import { JsonEL } from "../node/el/jsonEL";
import loadEL from "../node/el/loadEL";

export const renderXML = (elOrJsonEL: JsonEL | EL, withControlEl = false): string => {
    const el = loadEL(elOrJsonEL);
    const xml = `\
<?xml version="1.0" encoding="utf-8"?>
${el.outerXML(withControlEl)}
`;
    return xml;
};

export default renderXML;
