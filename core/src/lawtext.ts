import { parse } from "./parser/lawtext";
import * as renderer from "./renderer";
import renderLawtext from "./renderer/lawtext";
import { Analysis, analyze as analyzeEL } from "./analyzer";
import loadEL from "./node/el/loadEL";
import { xmlToEL } from "./node/el/xmlToEL";
import { JsonEL } from "./node/el/jsonEL";
import addSentenceChildrenControls from "./parser/addSentenceChildrenControls";
import * as std from "./law/std";
import { assertNever } from "./util";
import formatXML from "./util/formatXml";
import { VirtualLine } from "./parser/std/virtualLine";
import { fetchLawData } from "./elaws_api";

export const intypeChoices = ["fromext", "lawtext", "xml", "json"] as const;
export const outtypeChoices = ["fromext", "lawtext", "xml", "json", "html", "htmlfragment", "docx"] as const;
type ToSingleKeyObj<T extends string | number | symbol, V> = T extends unknown ? {[K in T]: V} : never;
export interface RunArgs {
    input: { elaws: string } | ToSingleKeyObj<Exclude<(typeof intypeChoices)[number], "fromext">, string>;
    outtypes: Exclude<(typeof outtypeChoices)[number], "fromext">[];
    analyze: boolean;
    format: boolean;
    controlel: boolean;
}

export const runHelp = `\
usage: lawtext.run(<options>)

example: lawtext.run({ input: {elaws:"405AC0000000088"}, outtypes: ["lawtext"] }).then(r => console.log(r.lawtext))

options:
    input: { elaws: string } | { lawtext: string } | { xml: string } | { json: string }
        # For \`elaws\` input, specify lawID or lawNum to be requested to e-LAWS API.
    outtypes: ("lawtext" | "xml" | "json" | "html" | "htmlfragment" | "docx")[]
        # Specify the output types.
    analyze: boolean [default: false]
        # If true, conduct the analysis process.
    format: boolean [default: false]
        # If true, format the XML or JSON output.
    controlel: boolean [default: false]
        # If true, emit the control elements in XML or JSON output.
`;

export interface RunResult {
    virtuallines: VirtualLine[],
    analysis: Analysis,
    docx: Uint8Array | Buffer,
    lawtext: string,
    xml: string,
    json: JsonEL,
    html: string,
    htmlfragment: string,
}

export const run = async (args: RunArgs) => {
    const requiredKeys = ["input", "outtypes"] as const;
    const missingKeys = requiredKeys.filter(k => !(k in args));
    if (missingKeys.length !== 0) {
        const message = `Please specify ${missingKeys.join(", ")}`;
        throw new Error(message);
    }

    const {
        input,
        outtypes,
        analyze = false,
        format = false,
        controlel = false,
    } = args;

    const ret: Partial<RunResult> = {};

    let law: std.Law;
    if ("elaws" in input) {
        const lawData = await fetchLawData(input.elaws);
        law = xmlToEL(lawData.xml) as std.Law;
        if (analyze) {
            addSentenceChildrenControls(law);
        }
    } else if ("xml" in input) {
        law = xmlToEL(input.xml) as std.Law;
        if (analyze) {
            addSentenceChildrenControls(law);
        }
    } else if ("json" in input) {
        const rawLaw = JSON.parse(input.json) as JsonEL;
        try {
            law = loadEL(rawLaw) as std.Law;
        } catch (e) {
            console.error("[loading json at main]", e);
            throw e;
        }
        if (analyze) {
            addSentenceChildrenControls(law);
        }
    } else if ("lawtext" in input) {
        try {
            const result = parse(input.lawtext);
            law = result.value;
            for (const error of result.errors) {
                console.error(error);
            }
            ret["virtuallines"] = result.virtualLines;
        } catch (e) {
            console.error("[parsing lawtext at main]", e);
            throw e;
        }
    } else { throw assertNever(input); }

    if (analyze) {
        const analysis = analyzeEL(law);
        ret["analysis"] = analysis;
    }

    for (const outtype of new Set(outtypes)) {
        if (outtype === "docx") {
            const u8 = await renderer.renderDocxAsync(law.json());
            ret[outtype] = u8;
        } else if (outtype === "lawtext") {
            const outtext = renderLawtext(law);
            ret[outtype] = outtext;
        } else if (outtype === "xml") {
            let outtext = renderer.renderXML(law, controlel);
            if (format) {
                outtext = formatXML(outtext);
            }
            ret[outtype] = outtext;
        } else if (outtype === "json") {
            ret[outtype] = law.json(controlel, controlel);
        } else if (outtype === "html") {
            const outtext = renderer.renderHTML(law);
            ret[outtype] = outtext;
        } else if (outtype === "htmlfragment") {
            const outtext = renderer.renderHTMLfragment(law);
            ret[outtype] = outtext;
        } else { throw assertNever(outtype); }
    }

    return ret;
};

run.help = runHelp;
