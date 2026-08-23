import React from "react";
import type { EL } from "../node/el/index.ts";
import * as std from "../law/std/index.ts";
import { DOCXLaw } from "./rules/law.tsx";
import { renderDocxAsync as innerRenderDocxAsync } from "./common/docx/file.tsx";
import type { DOCXOptions } from "./common/docx/component.tsx";
import { DOCXAnyELs } from "./rules/any.tsx";
import loadEL from "../node/el/loadEL.ts";
import type { JsonEL } from "../node/el/jsonEL.ts";


export const renderDocxAsync = (elOrJsonEL: JsonEL | EL, docxOptions?: DOCXOptions): Promise<Uint8Array | Buffer> => {
    const el = loadEL(elOrJsonEL);
    const element = std.isLaw(el)
        ? <DOCXLaw el={el} indent={0} docxOptions={docxOptions ?? {}} />
        : <DOCXAnyELs els={[el as std.StdEL | std.__EL]} indent={0} docxOptions={docxOptions ?? {}}/>;

    return innerRenderDocxAsync(element, docxOptions);
};

export default renderDocxAsync;
