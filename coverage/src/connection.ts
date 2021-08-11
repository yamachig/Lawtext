
import mongoose from "mongoose";
import { LawCoverage } from "./lawCoverage";
import { lawCoverageSchema } from "./schema";

export interface ConnectionInfo {
    connection: mongoose.Connection;
    lawCoverage: mongoose.Model<LawCoverage>;
}

export const connect = async (uri: string): Promise<ConnectionInfo> => {
    const connection = await mongoose.createConnection(
        uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
    );
    const lawCoverage = connection.model<LawCoverage>("LawCoverage", lawCoverageSchema);
    return {
        connection,
        lawCoverage,
    };
};
