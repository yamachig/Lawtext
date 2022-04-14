import { EL, JsonEL, loadEl } from "../node/el";

export const renderXML = (elOrJsonEL: JsonEL | EL, withControlEl = false): string => {
    const el = loadEl(elOrJsonEL);
    const xml = `\
<?xml version="1.0" encoding="utf-8"?>
${el.outerXML(withControlEl)}
`;
    return xml;
};

export default renderXML;
