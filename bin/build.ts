import * as fs from "fs";
import * as nunjucks from "nunjucks";
import * as path from "path";
import * as peg from "pegjs";
import * as tspegjs from "ts-pegjs";
import { promisify } from "util";
import make_lawnum_table from "./make_lawnum_table";

export const main = async () => {
    const basePath = path.join(__dirname, "..");
    const srcPath = path.join(basePath, "src");
    const distPath = path.join(basePath, "dist");

    // if(!fs.existsSync(dest_path)) fs.mkdirSync(dest_path);

    const input = await promisify(fs.readFile)(
        path.join(srcPath, "parser.pegjs"),
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
            "customHeader": `import * as util from "./util"; import * as std from "./std_law";`
        },
    } as peg.OutputFormatAmdCommonjs);

    await promisify(fs.writeFile)(
        path.join(srcPath, "parser.ts"),
        parser,
        { encoding: "utf-8" },
    );

    let templates = nunjucks.precompile(
        path.join(srcPath, "templates"),
        {
            include: [".+"],
        },
    );
    templates = `if(!("window" in global)) global.window = {};
${templates}
if(exports) exports.nunjucksPrecompiled = window.nunjucksPrecompiled;
`;
    await promisify(fs.writeFile)(
        path.join(srcPath, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );
    await promisify(fs.mkdir)(distPath, { recursive: true });
    await promisify(fs.writeFile)(
        path.join(distPath, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );

    await make_lawnum_table();
}

if (typeof require !== "undefined" && require.main === module) {
    process.on('unhandledRejection', e => {
        console.dir(e);
        process.exit(1);
    });
    main();
}

