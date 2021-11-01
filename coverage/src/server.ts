// import * as compression from "compression"
import express from "express";
// import path from "path";
import config from "./config";
import { connect, ConnectionInfo } from "./connection";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackConfigFn from "../webpack-configs/client";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";

const asyncMiddleware = (fn: express.RequestHandler): express.RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };

const app = express();

const webpackConfig = webpackConfigFn({ DEV_SERVER: "DEV_SERVER" }, { mode: "development" });

const webpackCompiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(webpackCompiler, {
    publicPath: (webpackConfig.devServer.static as WebpackDevServer.Static).publicPath as string,
}));

// app.use(express.static(path.join(process.cwd(), "public")));
// app.use(compression());

let _db: ConnectionInfo | null;
const getDB = async () => {
    const db = _db ?? await connect(config.MONGODB_URI);
    _db = db;
    return db;
};

app.get(
    "/lawCoverages",
    asyncMiddleware(async (request: express.Request, response: express.Response) => {
        const db = await getDB();
        const lawCoverages = await db.lawCoverage
            .find()
            .select([
                "LawID",
                "LawNum",
                "LawTitle",
                "Enforced",
                "Path",
                "XmlName",
                "Era",
                "Year",
                "LawType",
                "Num",
                "updateDate",
                "originalLaw.ok.requiredms",
                "renderedLawtext.ok.requiredms",
                "parsedLaw.ok.requiredms",
                "lawDiff.ok.requiredms",
                "lawDiff.ok.mostSeriousStatus",
            ]);
        // response.setHeader("Cache-Control", "public, max-age=2592000");
        // response.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
        response.json(lawCoverages);
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

async function main(): Promise<void> {
    const port = webpackConfig.devServer.port;
    app.listen(
        port,
        () => {
            console.log(`Serving at http://localhost:${port}/`);
        },
    );
}

export default main;
