
import mongoose from "mongoose";
import type { LawCoverage } from "./lawCoverage.ts";
import { lawCoverageSchema } from "./schema.ts";

export interface ConnectionInfo {
    connection: mongoose.Connection;
    lawCoverage: mongoose.Model<LawCoverage>;
}

export const connect = async (uri: string): Promise<ConnectionInfo> => {
    const connection = await mongoose.createConnection(
        uri,
        {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
        },
    );
    const lawCoverage = connection.model<LawCoverage>("LawCoverage", lawCoverageSchema);
    return {
        connection,
        lawCoverage,
    };
};
