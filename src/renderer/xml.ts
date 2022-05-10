import { EL } from "../node/el";
import { JsonEL } from "../node/el/jsonEL";
import loadEL from "../node/el/loadEL";
import formatXML from "../util/formatXml";

export const renderXML = (elOrJsonEL: JsonEL | EL, withControlEl = false, format = false): string => {
    const el = loadEL(elOrJsonEL);
    let body = el.outerXML(withControlEl);
    if (format) body = formatXML(body);
    const xml = `\
<?xml version="1.0" encoding="utf-8"?>
${body}
`;
    return xml;
};

export default renderXML;
