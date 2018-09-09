import { describe, it, before } from "mocha"
import * as chai from "chai"
import { render as renderLawtext } from "../src/renderers/lawtext"
import * as util from "../src/util"
import { getLawList, ensureList, getLawXml } from "./prepare_test";

before(() => {
    ensureList();
});

it("Render and Parse Lawtext", async () => {
    const [list, listByLawnum] = await getLawList();
    const law = util.xml_to_json(await getLawXml("平成五年法律第八十八号"));
    const rendered = renderLawtext(law);
    console.log(rendered.slice(0, 1000))
});
