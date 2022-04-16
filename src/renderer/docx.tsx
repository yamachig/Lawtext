import React from "react";
import { EL, JsonEL, loadEl } from "../node/el";
import * as std from "../law/std";
import { DOCXLaw } from "./rules/law";
import { DOCXOptions, renderDocxAsync as innerRenderDocxAsync } from "./rules/docx";
import { DOCXAnyELs } from "./rules/any";


export const renderDocxAsync = (elOrJsonEL: JsonEL | EL, docxOptions?: DOCXOptions): Promise<Uint8Array | Buffer> => {
    const el = loadEl(elOrJsonEL);
    const element = std.isLaw(el)
        ? <DOCXLaw el={el} indent={0} docxOptions={docxOptions ?? {}} />
        : <DOCXAnyELs els={[el as std.StdEL | std.__EL]} indent={0} docxOptions={docxOptions ?? {}}/>;
    return innerRenderDocxAsync(element);
};

export default renderDocxAsync;
