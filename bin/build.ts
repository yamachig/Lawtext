import * as peg from "pegjs"
import * as tspegjs from "ts-pegjs"
import * as nunjucks from "nunjucks"
import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"
import make_lawnum_table from "./make_lawnum_table"

export async function main() {
    const base_path = path.join(__dirname, "..");
    const src_path = path.join(base_path, "src");
    // let dest_path = path.join(base_path, "dest");

    // if(!fs.existsSync(dest_path)) fs.mkdirSync(dest_path);

    const input = await promisify(fs.readFile)(
        path.join(src_path, "parser.pegjs"),
        { encoding: "utf-8" },
    );

    const options: peg.OutputFormatAmdCommonjs = {
        allowedStartRules: ["start", "INLINE", "ranges"],
        output: "source",
        format: "commonjs",
        plugins: [tspegjs],
    };
    const parser = peg.generate(input, {
        ...options,
        "tspegjs": {
            "noTslint": false,
            "customHeader": `import * as util from "./util";`
        },
    } as peg.OutputFormatAmdCommonjs);

    await promisify(fs.writeFile)(
        path.join(src_path, "parser.ts"),
        parser,
        { encoding: "utf-8" },
    );

    let templates = nunjucks.precompile(
        path.join(src_path, "templates"),
        {
            include: [".+"],
        },
    );
    templates = `if(!("window" in global)) global.window = {};
${templates}
export const nunjucksPrecompiled = window.nunjucksPrecompiled;
`;
    await promisify(fs.writeFile)(
        path.join(src_path, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );

    await make_lawnum_table();
}

if (typeof require !== "undefined" && require.main === module) {
    main();
}

