import { Context, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import * as ddb from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { search, Store, Stores, updateIndex } from "lawtext-api-search";
import { FetchElawsLoader } from "lawtext/dist/src/data/loaders/FetchElawsLoader";

const getClient = () => {
    const ddbOptions: ddb.DynamoDBClientConfig = (
        (!process.env.FUNCTION_ARN)
            ? {
                endpoint: "http://dynamodb:8000",
            }
            // : (() => { throw new Error(); })()
            : {}
    );
    const ddbClient = new ddb.DynamoDBClient(ddbOptions);
    return ddbClient;
};

const ensureTable = async (ddbClient: ddb.DynamoDBClient, tableName: string) => {
    try {
        await ddbClient.send(new ddb.DescribeTableCommand({
            TableName: tableName,
        }));
    } catch (e) {
        if (e instanceof ddb.ResourceNotFoundException) {
            await ddbClient.send(new ddb.CreateTableCommand({
                TableName: tableName,
                KeySchema: [{ AttributeName: "key", KeyType: "HASH" }],
                AttributeDefinitions: [{ AttributeName: "key", AttributeType: "S" }],
                BillingMode: "PAY_PER_REQUEST",
            }));
            await ddb.waitUntilTableExists({ client: ddbClient, maxWaitTime: 30 }, { TableName: tableName });
        } else {
            throw e;
        }
    }
};

const chop = <T>(items: T[], batchSize: number) => {
    const ret: T[][] = [];
    for (let b = 0; b < Math.ceil(items.length / batchSize); b++) {
        const l = items.slice(b * batchSize, (b + 1) * batchSize);
        ret.push(l);
    }
    return ret;
};

class DDBStore extends Store {
    private _ensured = false;

    public constructor(
        public ddbClient: ddb.DynamoDBClient,
        public tableName: string,
    ) {
        super();
    }

    public async ensureTable() {
        if (!this._ensured) {
            await ensureTable(this.ddbClient, this.tableName);
            this._ensured = true;
        }
    }

    public async get(keys: string[]) {
        await this.ensureTable();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kvs: Record<string, any>[] = [];
        for (const batchKeys of chop(Array.from(new Set(keys)), 50)) {
            const result = await this.ddbClient.send(new ddb.BatchGetItemCommand({
                RequestItems: {
                    [this.tableName]: {
                        Keys: batchKeys.map(k => ({ key: { S: k } })),
                    },
                },
            }));
            if (result.Responses) {
                kvs.push(...result.Responses[this.tableName].map(o => unmarshall(o)));
            }
        }
        const items = Object.fromEntries(kvs.map(kv => [kv.key, kv.value]));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items as Record<string, any>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async set(items: {[key: string]: Record<string, any>}) {
        await this.ensureTable();
        for (const batchItems of chop(Object.entries(items), 50)) {
            await this.ddbClient.send(new ddb.TransactWriteItemsCommand({
                TransactItems: batchItems.map(([key, value]) => ({
                    Put: {
                        TableName: this.tableName,
                        Item: { key: { S: key }, value: { M: marshall(value) } },
                    },
                }))
            }));
        }
    }

    public async getKeys() {
        await this.ensureTable();
        const kvs: Record<string, unknown>[] = [];
        let ExclusiveStartKey: Record<string, ddb.AttributeValue> | undefined = undefined;
        for (;;) {
            const result = await this.ddbClient.send(new ddb.ScanCommand({
                TableName: this.tableName,
                ProjectionExpression: "#k",
                ExpressionAttributeNames: { "#k": "key" },
                ExclusiveStartKey: ExclusiveStartKey,
            }));
            if (result.Items) {
                kvs.push(...result.Items.map(o => unmarshall(o)));
            }
            if (result.LastEvaluatedKey) {
                ExclusiveStartKey = result.LastEvaluatedKey as Record<string, ddb.AttributeValue>;
            } else {
                break;
            }
        }
        const keys = kvs.map(kv => kv.key as string);
        return keys;
    }

    public async delete(keys: string[]) {
        await this.ensureTable();
        for (const batchKeys of chop(keys, 50)) {
            await this.ddbClient.send(new ddb.TransactWriteItemsCommand({
                TransactItems: batchKeys.map(key => ({
                    Delete: {
                        TableName: this.tableName,
                        Key: { key: { S: key } },
                    },
                }))
            }));
        }
    }

    public async empty() {
        await this.ensureTable();
        const keys = await this.getKeys();
        return this.delete(keys);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const lambdaHandler = async (_event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyResultV2> => {
    const ddbClient = getClient();
    const stores: Stores = {
        lawInfos: new DDBStore(ddbClient, "BaseLawInfos"),
        aliases: new DDBStore(ddbClient, "Aliases"),
        invIndex: new DDBStore(ddbClient, "LawTitleInvIndex"),
    };
    const loader = new FetchElawsLoader();

    if (_event.requestContext.http.path === "/updateIndex") {

        await updateIndex(stores, loader);

        return {
            isBase64Encoded: false,
            statusCode: 200,
            body: JSON.stringify({ message: "Index updated." }),
        };
    } else if (_event.requestContext.http.path === "/search") {

        if (!_event.queryStringParameters || !("q" in _event.queryStringParameters)) return {
            isBase64Encoded: false,
            statusCode: 400,
            body: JSON.stringify({ error: "Search key missing." }),
        };
        const searchKey = _event.queryStringParameters.q ?? "";
        const lawInfo = await search(searchKey, stores);

        return {
            isBase64Encoded: false,
            statusCode: 200,
            body: JSON.stringify(lawInfo),
        };
    }
    return {
        isBase64Encoded: false,
        statusCode: 400,
        body: JSON.stringify({ error: "Not found" }),
    };

};
