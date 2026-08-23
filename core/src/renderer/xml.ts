import type { EL } from "../node/el/index.ts";
import type { JsonEL } from "../node/el/jsonEL.ts";
import loadEL from "../node/el/loadEL.ts";
import formatXML from "../util/formatXml.ts";

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
