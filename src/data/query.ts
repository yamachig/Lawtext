import { EL, elementToJson } from "@coresrc/util";
import { LawInfo, getLawList, TextFetcher, getLawXmlByInfo } from "./lawlist";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();

interface QueryCriteria<TItem> {
    match: (item: TItem) => boolean | Promise<boolean>;
}

type QueryCriteriaOrFunc<TItem, TQuery extends QueryCriteria<TItem>> = TQuery | QueryCriteria<TItem>["match"];

const AllCriteria = {
    match: () => true,
};

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T, void, undefined>;
}

export class Query<
    TItem,
    TCriteria extends QueryCriteria<TItem> = QueryCriteria<TItem>,
> implements AsyncIterable<TItem> {

    public constructor (
        public population: AsyncIterable<TItem>,
        public criteria: TCriteria,
    ) {}

    async *[Symbol.asyncIterator](): AsyncGenerator<TItem, void, undefined> {
        for await (const item of this.population) {
            const matched = await this.criteria.match(item);
            if (!matched) continue;
            yield item;
        }
    }

    public map<T, TRet=T extends void | undefined ? never : T>(func: (item: TItem) => T | Promise<T>): Query<TRet> {
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
            AllCriteria,
        );
    }

    public filter<
        TQueryCriteriaOrFunc extends QueryCriteriaOrFunc<TItem, QueryCriteria<TItem>>,
        TRetCriteria extends QueryCriteria<TItem>
            = TQueryCriteriaOrFunc extends QueryCriteriaOrFunc<TItem, infer TNewCriteria>
                ? TNewCriteria
                : never,
    >(criteriaOrFunc: TQueryCriteriaOrFunc): Query<TItem, TRetCriteria> {
        return new Query<TItem, TRetCriteria>(
            this[Symbol.asyncIterator](),
            ("match" in criteriaOrFunc
                ? criteriaOrFunc
                : { match: criteriaOrFunc }) as unknown as TRetCriteria,
        );
    }

    public pickKey<K extends keyof TItem>(key: K): Query<TItem[K]> {
        return this.map(item => item[key]);
    }

    public pickKeys<K extends keyof TItem>(...keys: K[]): Query<Pick<TItem, K>> {
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
                console.info(`Query progress:\t⌛ running...\t(${matchCount} matches\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }
        }
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        if (msec > 1000) {
            console.info(`Query progress:\t✓ completed.\t(${matchCount} matches\tin ${msec} msec)`);
        }
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

type LawCriteriaOrFuncOrArgs<TQuery extends QueryCriteria<LawQueryItem>> = QueryCriteriaOrFunc<LawQueryItem, TQuery> | LawCriteriaArgs;
export class LawCriteria implements QueryCriteria<LawQueryItem> {

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
    public static fromLawInfo(lawInfo: LawInfo): LawQueryItem {
        const item = new LawQueryItem(
            lawInfo.LawID,
            lawInfo.LawNum,
            lawInfo.LawTitle,
            lawInfo.Path,
            lawInfo.XmlName,
        );
        item.ReferencingLawNums = lawInfo.ReferencingLawNums;
        item.ReferencedLawNums = lawInfo.ReferencedLawNums;
        return item;
    }

    protected xml: string | null = null;
    public async getXML(dataPath: string, textFetcher: TextFetcher): Promise<string | null> {
        if (this.xml === null) {
            this.xml = await getLawXmlByInfo(dataPath, this, textFetcher);
        }
        return this.xml;
    }

    protected document: XMLDocument | null = null;
    public async getDocument(dataPath: string, textFetcher: TextFetcher): Promise<XMLDocument | null> {
        if (this.document === null) {
            const xml = await this.getXML(dataPath, textFetcher);
            if (xml === null) return null;
            this.document = domParser.parseFromString(xml, "text/xml");
        }
        return this.document;
    }

    protected el: EL | null = null;
    public async getEl(dataPath: string, textFetcher: TextFetcher): Promise<EL | null> {
        if (this.el === null) {
            const doc = await this.getDocument(dataPath, textFetcher);
            if (doc === null) return null;
            this.el = elementToJson(doc.documentElement);
        }
        return this.el;
    }

    public toString(): string {
        return `${this.LawID} ${this.LawNum}「${this.LawTitle}」`;
    }
}

async function *getLawQueryPopulationWithProgress(lawListOrPromise: LawInfo[] | Promise<LawInfo[]> | (() => LawInfo[] | Promise<LawInfo[]>)) {
    const startTime = new Date();
    let lastMessageTime = startTime;
    let matchCount = 0;
    const lawList = typeof lawListOrPromise === "function" ? await lawListOrPromise() : await lawListOrPromise;
    for (const item of lawList.map(LawQueryItem.fromLawInfo)) {
        matchCount++;
        yield item;
        const now = new Date();
        if (now.getTime() - lastMessageTime.getTime() > 1000) {
            console.info(`   << source:\t⌛ running...\t(${matchCount}/${lawList.length}=${Math.floor(matchCount / lawList.length * 100)}%\tin ${now.getTime() - startTime.getTime()} msec)`);
            lastMessageTime = now;
        }
    }

    const now = new Date();
    const msec = now.getTime() - startTime.getTime();
    if (msec > 1000) {
        console.info(`   << source:\t✓ completed.\t(${matchCount} total  \tin ${msec} msec)`);
    }
}

export class LawQuery<TCriteria extends QueryCriteria<LawQueryItem> = QueryCriteria<LawQueryItem>>
    extends Query<LawQueryItem, TCriteria> {

    public constructor (
        population: AsyncIterable<LawQueryItem>,
        criteriaOrFuncOrArgs: LawCriteriaOrFuncOrArgs<TCriteria>,
    ) {
        const casted: LawCriteriaOrFuncOrArgs<QueryCriteria<LawQueryItem>> = criteriaOrFuncOrArgs;
        let criteria: QueryCriteria<LawQueryItem>;
        if ("match" in casted) {
            criteria = casted;
        } else if (typeof casted === "function") {
            criteria = { "match": casted };
        } else {
            criteria = new LawCriteria(casted);
        }
        super(
            population,
            criteria as unknown as TCriteria,
        );
    }

    public filter<
        TLawCriteriaOrFuncOrArgs extends LawCriteriaOrFuncOrArgs<QueryCriteria<LawQueryItem>>,
        TRetCriteria extends QueryCriteria<LawQueryItem>
            = TLawCriteriaOrFuncOrArgs extends LawCriteriaArgs
                ? LawCriteria
                : TLawCriteriaOrFuncOrArgs extends QueryCriteriaOrFunc<LawQueryItem, infer TNewCriteria>
                    ? TNewCriteria
                    : QueryCriteria<LawQueryItem>,
    >(criteriaOrFuncOrArgs: TLawCriteriaOrFuncOrArgs): LawQuery<TRetCriteria> {
        return new LawQuery<TRetCriteria>(
            this[Symbol.asyncIterator](),
            criteriaOrFuncOrArgs as LawCriteriaOrFuncOrArgs<TRetCriteria>,
        );
    }

    public static fromFetchInfo<TCriteria extends QueryCriteria<LawQueryItem>>(
        dataPath: string,
        textFetcher: TextFetcher,
        criteriaOrFuncOrArgs: LawCriteriaOrFuncOrArgs<TCriteria>,
    ): LawQuery {
        return new LawQuery(
            getLawQueryPopulationWithProgress((async () => {
                const [lawList] = await getLawList(dataPath, textFetcher);
                return lawList;
            })),
            criteriaOrFuncOrArgs,
        );
    }
}
