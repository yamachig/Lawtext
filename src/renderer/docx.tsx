import React from "react";
import { EL, JsonEL, loadEl } from "../node/el";
import * as std from "../law/std";
import { DOCXLaw } from "./rules/law";
import { AnyELProps, DOCXAnyEL } from "./rules/any";
import { renderDocxAsync as innerRenderDocxAsync } from "./rules/docx";


export const renderDocxAsync = (elOrJsonEL: JsonEL | EL): Promise<Uint8Array | Buffer> => {
    const el = loadEl(elOrJsonEL);
    const element = std.isLaw(el)
        ? <DOCXLaw el={el} indent={0} docxOptions={{}} />
        : <DOCXAnyEL {...({ el, indent: 0 } as AnyELProps)} docxOptions={{}}/>;
    return innerRenderDocxAsync(element);
};

export default renderDocxAsync;
