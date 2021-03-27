import { assertNever, EL, elementToJson } from "@coresrc/util";
import { LawInfo, getLawList, TextFetcher, getLawXmlByInfo } from "./lawlist";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();

interface BaseQueryCriteria<TItem> {
    match: (item: TItem) => boolean | Promise<boolean>;
}

type QueryCriteria<
    TItem,
    TQuery extends BaseQueryCriteria<TItem> | null
        = BaseQueryCriteria<TItem> | null,
> = TQuery | BaseQueryCriteria<TItem>["match"];

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T, void, undefined>;
}

export class Query<
    TItem,
    TBaseCriteriaOrNull extends BaseQueryCriteria<TItem> | null,
> implements AsyncIterable<TItem> {
    public population: AsyncIterable<TItem>;
    public criteria: TBaseCriteriaOrNull;

    public constructor (
        population: AsyncIterable<TItem>,
        criteria: QueryCriteria<TBaseCriteriaOrNull>,
    ) {
        this.population = population;
        if (criteria === null) {
            this.criteria = criteria as TBaseCriteriaOrNull;
        } else if ("match" in criteria) {
            this.criteria = criteria as unknown as TBaseCriteriaOrNull;
        } else if (typeof criteria === "function") {
            this.criteria = { "match": criteria } as unknown as TBaseCriteriaOrNull;
        } else {
            throw assertNever(criteria);
        }
    }

    async *[Symbol.asyncIterator](): AsyncGenerator<TItem, void, undefined> {
        if (this.criteria === null) {
            yield* this.population;
        } else {
            for await (const item of this.population) {
                const matched = await this.criteria.match(item);
                if (!matched) continue;
                yield item;
            }
        }
    }

    public map<T, TRet=T extends void | undefined ? never : T>(func: (item: TItem) => T | Promise<T>): Query<TRet, null> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Query(
            (async function *() {
                for await (const item of self) {
                    const value = await func(item);
                    if (value === undefined) {
                        throw TypeError(`Query.map: the mapped function (${func}) returned an undefined. Please check the definition of the function. (First occurance: ${item})`);
                    }
                    yield value as unknown as TRet;
                }
            })(),
            null,
        );
    }

    public filter<
        TNewCriteria extends QueryCriteria<TItem>,
        TNewBaseCriteriaOrNull extends BaseQueryCriteria<TItem> | null
            = TNewCriteria extends QueryCriteria<TItem, infer Inf>
                ? Inf
                : never,
    >(criteria: TNewCriteria): Query<TItem, TNewBaseCriteriaOrNull> {
        return new Query(
            this[Symbol.asyncIterator](),
            criteria as QueryCriteria<TNewBaseCriteriaOrNull>,
        );
    }

    public pickKey<K extends keyof TItem>(key: K): Query<TItem[K], null> {
        return this.map(item => item[key]);
    }

    public pickKeys<K extends keyof TItem>(...keys: K[]): Query<Pick<TItem, K>, null> {
        return this.map(item => {
            const picked = {} as Pick<TItem, K>;
            for (const key of keys) {
                picked[key] = item[key];
            }
            return picked;
        });
    }

    public async toArray(): Promise<TItem[]> {
        const arr: TItem[] = [];
        await this.forEach(item => arr.push(item));
        return arr;
    }

    public async forEach(func: (item: TItem) => unknown | Promise<unknown>): Promise<void> {
        const startTime = new Date();
        let lastMessageTime = startTime;
        let matchCount = 0;
        for await (const item of this) {
            matchCount++;
            await func(item);
            const now = new Date();
            if (now.getTime() - lastMessageTime.getTime() > 1000) {
                console.info(`Query progress:\t⌛ running...\t(${matchCount.toString().padStart(4, " ")} matches\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }
        }
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        console.info(`Query progress:\t✓ completed.\t(${matchCount.toString().padStart(4, " ")} matches\tin ${msec} msec)`);
    }

}

const getDefaultLawCriteriaArgs = () => ({
    LawID: undefined as RegExp | undefined,
    LawNum: undefined as RegExp | undefined,
    LawTitle: undefined as RegExp | undefined,
    Path: undefined as RegExp | undefined,
    XmlName: undefined as RegExp | undefined,
    ReferencingLawNum: undefined as RegExp | undefined,
    ReferencedLawNum: undefined as RegExp | undefined,
});
export type LawCriteriaArgs = ReturnType<typeof getDefaultLawCriteriaArgs>;

export type LawCriteria<
    TLawQueryItem extends LawQueryItem = LawQueryItem,
    TBaseCriteriaOrNull extends BaseQueryCriteria<TLawQueryItem> | null
        = BaseQueryCriteria<TLawQueryItem> | null,
> = QueryCriteria<TLawQueryItem, TBaseCriteriaOrNull> | LawCriteriaArgs;
export class BaseLawCriteria implements BaseQueryCriteria<LawQueryItem> {

    public args: LawCriteriaArgs;

    public constructor(args: Partial<LawCriteriaArgs>){
        const defaults = getDefaultLawCriteriaArgs();
        const invalidKeys: [key: string, message: string][] = [];
        for (const key in args) {
            if (!(key in defaults)) {
                invalidKeys.push([key, "unknown key"]);
                continue;
            }
            const value = args[key as keyof typeof args];
            if (value !== undefined && !(value instanceof RegExp)) {
                invalidKeys.push([key, "RegExp needed"]);
                continue;
            }
        }
        if (invalidKeys.length > 0) {
            throw new TypeError(`LawCriteria: invalid key(s): ${invalidKeys.map(([key, message]) => `"${key}" (${message})`).join(", ")}`);
        }
        this.args = { ...defaults, ...args };
    }

    match(item: LawQueryItem): boolean {
        if (this.args.LawID !== undefined && !this.args.LawID.exec(item.LawID)) return false;
        if (this.args.LawNum !== undefined && !this.args.LawNum.exec(item.LawNum)) return false;
        if (this.args.LawTitle !== undefined && !this.args.LawTitle.exec(item.LawTitle)) return false;
        if (this.args.Path !== undefined && !this.args.Path.exec(item.Path)) return false;
        if (this.args.XmlName !== undefined && !this.args.XmlName.exec(item.XmlName)) return false;
        if (this.args.ReferencingLawNum !== undefined) {
            let matched = false;
            for (const num of item.ReferencingLawNums) {
                if (this.args.ReferencingLawNum.exec(num)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }
        if (this.args.ReferencedLawNum !== undefined) {
            let matched = false;
            for (const num of item.ReferencedLawNums) {
                if (this.args.ReferencedLawNum.exec(num)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }
        return true;
    }
}

export class LawQueryItem extends LawInfo {
    public dataPath: string | null = null;
    public textFetcher: TextFetcher | null = null;
    public static fromLawInfo(lawInfo: LawInfo, dataPath: string | null, textFetcher: TextFetcher | null): LawQueryItem {
        const item = new LawQueryItem(
            lawInfo.LawID,
            lawInfo.LawNum,
            lawInfo.LawTitle,
            lawInfo.Path,
            lawInfo.XmlName,
        );
        item.ReferencingLawNums = lawInfo.ReferencingLawNums;
        item.ReferencedLawNums = lawInfo.ReferencedLawNums;
        item.dataPath = dataPath;
        item.textFetcher = textFetcher;
        return item;
    }

    public async getXML(): Promise<string | null> {
        if (this.dataPath === null || this.textFetcher === null) throw Error("dataPath or textFetcher not specified");
        return getLawXmlByInfo(this.dataPath, this, this.textFetcher);
    }

    public async getDocument(): Promise<XMLDocument | null> {
        const xml = await this.getXML();
        if (xml === null) return null;
        return domParser.parseFromString(xml, "text/xml");
    }

    public async getEl(): Promise<EL | null> {
        const doc = await this.getDocument();
        if (doc === null) return null;
        return elementToJson(doc.documentElement);
    }

    public toString(): string {
        return `${this.LawID} ${this.LawNum}「${this.LawTitle}」`;
    }
}

async function *getLawQueryPopulationWithProgress(
    lawListOrPromise:
        | LawInfo[]
        | Promise<LawInfo[]>
        | (() => LawInfo[] | Promise<LawInfo[]>),
    dataPath: string | null, textFetcher: TextFetcher | null,
) {
    const startTime = new Date();
    let lastMessageTime = startTime;
    let matchCount = 0;
    const lawList = typeof lawListOrPromise === "function" ? await lawListOrPromise() : await lawListOrPromise;
    for (const lawInfo of lawList) {
        const item = LawQueryItem.fromLawInfo(lawInfo, dataPath, textFetcher);
        matchCount++;
        yield item;
        const now = new Date();
        if (now.getTime() - lastMessageTime.getTime() > 1000) {
            console.info(`   << source:\t⌛ running...\t(${matchCount.toString().padStart(4, " ")}/${lawList.length.toString().padStart(4, " ")}=${Math.floor(matchCount / lawList.length * 100)}%\tin ${now.getTime() - startTime.getTime()} msec)`);
            lastMessageTime = now;
        }
    }

    const now = new Date();
    const msec = now.getTime() - startTime.getTime();
    console.info(`   << source:\t✓ completed.\t(${matchCount.toString().padStart(4, " ")} total  \tin ${msec} msec)`);
}

export class LawQuery<
    TItem extends LawQueryItem = LawQueryItem,
    TBaseCriteria extends BaseQueryCriteria<TItem> | null
        = BaseQueryCriteria<TItem> | null,
> extends Query<TItem, TBaseCriteria> {

    public constructor (
        population: AsyncIterable<TItem>,
        criteria: LawCriteria<TItem, TBaseCriteria>,
    ) {
        const casted: LawCriteria<TItem> = criteria;
        let this_criteria: QueryCriteria<TItem>;
        if (casted === null) {
            this_criteria = casted;
        } else if ("match" in casted) {
            this_criteria = casted;
        } else if (typeof casted === "function") {
            this_criteria = casted;
        } else {
            this_criteria = new BaseLawCriteria(casted);
        }
        super(
            population,
            this_criteria as unknown as QueryCriteria<TBaseCriteria>,
        );
    }

    public static fromFetchInfo<TCriteria extends BaseQueryCriteria<LawQueryItem> | null>(
        dataPath: string,
        textFetcher: TextFetcher,
        criteria: LawCriteria<LawQueryItem, TCriteria>,
    ): LawQuery {
        return new LawQuery(
            getLawQueryPopulationWithProgress(
                (async () => {
                    const [lawList] = await getLawList(dataPath, textFetcher);
                    return lawList;
                }),
                dataPath,
                textFetcher,
            ),
            criteria,
        );
    }

    public filter<
        TNewCriteria extends LawCriteria<TItem>,
        TNewBaseCriteria extends BaseQueryCriteria<TItem> | null
            = TNewCriteria extends LawCriteriaArgs
                ? BaseLawCriteria
                : TNewCriteria extends QueryCriteria<TItem, infer TInf>
                    ? TInf
                    : never,
    >(criteria: TNewCriteria): LawQuery<TItem, TNewBaseCriteria> {
        return new LawQuery<TItem, TNewBaseCriteria>(
            this[Symbol.asyncIterator](),
            criteria as LawCriteria<TItem, TNewBaseCriteria>,
        );
    }
}
