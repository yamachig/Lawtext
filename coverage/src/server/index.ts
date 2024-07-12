// import * as compression from "compression"
import express from "express";
// import path from "path";
import config from "../config";
import type { ConnectionInfo } from "../connection";
import { connect } from "../connection";
// import webpackDevMiddleware from "webpack-dev-middleware";
import webpackConfigFn from "../../webpack-configs/client";
// import webpack from "webpack";
// import WebpackDevServer from "webpack-dev-server";
import type { Loader } from "lawtext/dist/src/data/loaders/common";
import { FSStoredLoader } from "lawtext/dist/src/data/loaders/FSStoredLoader";
import { getOriginalLaw, getParsedLaw, getRenderedLawtext } from "../update/transform";
import { LawCoveragesManager } from "./lawCoverages";
import { fromSortStirng } from "../lawCoverage";
import type { AsyncZippable } from "lawtext/dist/src/util/zip";
import { zip } from "lawtext/dist/src/util/zip";


const asyncMiddleware = (fn: express.RequestHandler): express.RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };

const app = express();

const webpackConfig = webpackConfigFn({ DEV_SERVER: "DEV_SERVER" }, { mode: "development" });

// const webpackCompiler = webpack(webpackConfig);
// app.use(webpackDevMiddleware(webpackCompiler, {
//     publicPath: (webpackConfig.devServer.static as WebpackDevServer.Static).publicPath as string,
// }));

// app.use(express.static(path.join(process.cwd(), "public")));
// app.use(compression());

const static_root = process.argv[2];
app.use(express.static(static_root));

let _db: ConnectionInfo | null;
const getDB = async () => {
    const db = _db ?? await connect(config.MONGODB_URI);
    _db = db;
    return db;
};

let _loader: Loader | null;
const getLoader = () => {
    const loader = _loader ?? new FSStoredLoader(config.DATA_PATH);
    _loader = loader;
    return loader;
};

let _lawCoveragesManager: LawCoveragesManager | null;
const getLawCoveragesManager = async () => {
    const lawCoveragesManager = _lawCoveragesManager ?? new LawCoveragesManager(await getDB());
    _lawCoveragesManager = lawCoveragesManager;
    return lawCoveragesManager;
};

app.get(
    "/lawCoverages/index/:from-:to/sort/:sort",
    asyncMiddleware(async (request: express.Request, response: express.Response) => {
        const sort = fromSortStirng(request.params.sort);
        const lawCoveragesManager = await getLawCoveragesManager();
        const lawCoverages = await lawCoveragesManager.slice(
            parseInt(request.params.from),
            parseInt(request.params.to) + 1,
            sort,
        );
        response.json(lawCoverages);
        response.end();
        // db.connection.close();
    }),
);

app.get(
    "/lawCoverageCounts",
    asyncMiddleware(async (request: express.Request, response: express.Response) => {
        const lawCoveragesManager = await getLawCoveragesManager();
        const counts = await lawCoveragesManager.counts();
        response.json(counts);
        response.end();
        // db.connection.close();
    }),
);

app.get(
    "/lawCoverage/:LawID",
    asyncMiddleware(async (request: express.Request, response: express.Response) => {
        const db = await getDB();
        const lawCoverage = await db.lawCoverage.findOne({ LawID: request.params.LawID });
        if (lawCoverage) {
            // response.setHeader("Cache-Control", "public, max-age=2592000");
            // response.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
            response.json(lawCoverage);
        } else {
            response.status(404);
        }
        response.end();
    }),
);

app.get(
    "/intermediateData/:lawID",
    asyncMiddleware(async (request: express.Request, response: express.Response) => {
        const loader = getLoader();
        const lawID = request.params.lawID;
        const lawInfo = await loader.getLawInfoByLawID(lawID);

        const { origEL, origXML } = lawInfo
            ? await getOriginalLaw(lawInfo, loader)
            : { origEL: null, origXML: null };

        const { lawtext } = origEL
            ? await getRenderedLawtext(origEL)
            : { lawtext: null };

        const { parsedXML } = lawtext
            ? await getParsedLaw(lawtext)
            : { parsedXML: null };

        const zipData: AsyncZippable = {};
        if (origXML) zipData["origXML.xml"] = origXML;
        if (lawtext) zipData["lawtext.law.txt"] = lawtext;
        if (parsedXML) zipData["parsedXML.xml"] = parsedXML;

        response.contentType("application/zip");

        const zipBuf = await zip(zipData, { level: 9 });

        response.write(zipBuf);
    }),
);

const main = () => {
    const port = webpackConfig.devServer.port;
    app.listen(
        port,
        () => {
            console.log(`Serving static files from ${static_root}`);
            console.log(`Serving at http://localhost:${port}/`);
        },
    );
};

export default main;
