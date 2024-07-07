import React from "react";
import { EL } from "../node/el";
import * as std from "../law/std";
import { DOCXLaw } from "./rules/law";
import { renderDocxAsync as innerRenderDocxAsync } from "./common/docx/file";
import { DOCXOptions } from "./common/docx/component";
import { DOCXAnyELs } from "./rules/any";
import loadEL from "../node/el/loadEL";
import { JsonEL } from "../node/el/jsonEL";


export const renderDocxAsync = (elOrJsonEL: JsonEL | EL, docxOptions?: DOCXOptions): Promise<Uint8Array | Buffer> => {
    const el = loadEL(elOrJsonEL);
    const element = std.isLaw(el)
        ? <DOCXLaw el={el} indent={0} docxOptions={docxOptions ?? {}} />
        : <DOCXAnyELs els={[el as std.StdEL | std.__EL]} indent={0} docxOptions={docxOptions ?? {}}/>;

    return innerRenderDocxAsync(element, docxOptions);
};

export default renderDocxAsync;
