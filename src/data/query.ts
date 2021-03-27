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

const symbolFinalyzeQueryItem = Symbol("symbolFinalyzeQueryItem");
interface QueryItem {
    [symbolFinalyzeQueryItem]: () => void;
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

    public limit(max: number): Query<TItem, null> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Query(
            (async function *() {
                if (max <= 0) return;
                let count = 0;
                for await (const item of self) {
                    yield item;
                    count++;
                    if (count >= max) break;
                }
            })(),
            null,
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
            if (symbolFinalyzeQueryItem in item) {
                (item as unknown as QueryItem)[symbolFinalyzeQueryItem]();
            }
        }
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        console.info(`Query progress:\t✓ completed.\t(${matchCount.toString().padStart(4, " ")} matches\tin ${msec} msec)`);
    }

}

interface Validator<T> {
    typeDescription: string,
    default: () => T,
    validate: (v: unknown) => v is T,
}

type Validators<TArgs> = {
    [K in keyof TArgs]: Validator<TArgs[K]>
}

const getDefaultArgs = <VS extends {[key: string]: Validator<unknown>}>(validators: VS) => {
    const ret = {} as Record<string, unknown>;
    for (const key of Object.keys(validators)) {
        ret[key] = validators[key].default();
    }
    return ret as unknown as LawCriteriaArgs;
};

const RegExpValidator: Validator<RegExp | undefined> = {
    typeDescription: "RegExp",
    default: () => undefined,
    validate: (v): v is RegExp | undefined =>
        v === undefined || v instanceof RegExp,
};

const BooleanValidator: Validator<boolean | undefined> = {
    typeDescription: "boolean",
    default: () => undefined,
    validate: (v): v is boolean | undefined =>
        v === undefined || typeof v === "boolean",
};

export interface LawCriteriaArgs {
    LawID: RegExp | undefined,
    LawNum: RegExp | undefined,
    LawTitle: RegExp | undefined,
    Enforced: boolean | undefined,

    Path: RegExp | undefined,
    XmlName: RegExp | undefined,

    ReferencingLawNum: RegExp | undefined,
    ReferencedLawNum: RegExp | undefined,

    xml: RegExp | undefined,
    document: ((document: XMLDocument) => boolean | Promise<boolean>) | undefined,
    el: ((el: EL) => boolean | Promise<boolean>) | undefined,
}

const LawCriteriaValidator: Validators<LawCriteriaArgs> = {

    LawID: RegExpValidator,
    LawNum: RegExpValidator,
    LawTitle: RegExpValidator,
    Enforced: BooleanValidator,

    Path: RegExpValidator,
    XmlName: RegExpValidator,

    ReferencingLawNum: RegExpValidator,
    ReferencedLawNum: RegExpValidator,

    xml: RegExpValidator,
    document: {
        typeDescription: "function",
        default: (): LawCriteriaArgs["document"] => undefined,
        validate: (v): v is LawCriteriaArgs["document"] =>
            v === undefined || typeof v === "function",
    },
    el: {
        typeDescription: "function",
        default: (): LawCriteriaArgs["el"] => undefined,
        validate: (v): v is LawCriteriaArgs["el"] =>
            v === undefined || typeof v === "function",
    },

};

const getDefaultLawCriteriaArgs = () => getDefaultArgs(LawCriteriaValidator);

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
        for (const unknownKey in args) {
            if (!(unknownKey in defaults)) {
                invalidKeys.push([unknownKey, "unknown key"]);
                continue;
            }
            const key = unknownKey as keyof LawCriteriaArgs;
            if (!LawCriteriaValidator[key].validate(args[key])) {
                invalidKeys.push([key, `a value of ${LawCriteriaValidator[key].typeDescription} needed`]);
                continue;
            }
        }
        if (invalidKeys.length > 0) {
            throw new TypeError(`LawCriteria: invalid key(s): ${invalidKeys.map(([key, message]) => `"${key}" (${message})`).join(", ")}`);
        }
        this.args = { ...defaults, ...args };
    }

    async match(item: LawQueryItem): Promise<boolean> {
        if (this.args.LawID !== undefined && !this.args.LawID.exec(item.LawID)) return false;
        if (this.args.LawNum !== undefined && !this.args.LawNum.exec(item.LawNum)) return false;
        if (this.args.LawTitle !== undefined && !this.args.LawTitle.exec(item.LawTitle)) return false;
        if (this.args.Enforced !== undefined && this.args.Enforced !== item.Enforced) return false;
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
        if (this.args.xml !== undefined) {
            const xml = await item.getXML();
            if (xml === null || !this.args.xml.exec(xml)) return false;
        }
        if (this.args.document !== undefined) {
            const document = await item.getDocument();
            if (document === null || !this.args.document(document)) return false;
        }
        if (this.args.el !== undefined) {
            const el = await item.getEl();
            if (el === null || !this.args.el(el)) return false;
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
            lawInfo.Enforced,
            lawInfo.Path,
            lawInfo.XmlName,
        );
        item.ReferencingLawNums = lawInfo.ReferencingLawNums;
        item.ReferencedLawNums = lawInfo.ReferencedLawNums;
        item.dataPath = dataPath;
        item.textFetcher = textFetcher;
        return item;
    }

    protected _xml: string | null = null;
    public async getXML(): Promise<string | null> {
        if (this._xml === null) {
            if (this.dataPath === null || this.textFetcher === null) throw Error("dataPath or textFetcher not specified");
            this._xml = await getLawXmlByInfo(this.dataPath, this, this.textFetcher);
        }
        return this._xml;
    }

    protected _document: XMLDocument | null = null;
    public async getDocument(): Promise<XMLDocument | null> {
        if (this._document === null) {
            const xml = await this.getXML();
            if (xml === null) return null;
            this._document = domParser.parseFromString(xml, "text/xml");
        }
        return this._document;
    }

    protected _el: EL | null = null;
    public async getEl(): Promise<EL | null> {
        if (this._el === null) {
            const doc = await this.getDocument();
            if (doc === null) return null;
            this._el = elementToJson(doc.documentElement);
        }
        return this._el ;
    }

    public [symbolFinalyzeQueryItem](): void {
        this._el = null;
        this._document = null;
        this._xml = null;
    }

    public toString(): string {
        return `${this.LawID} ${this.Enforced ? "" : "【未施行】"}${this.LawNum}「${this.LawTitle}」`;
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
    let yieldCount = 0;
    const lawList = typeof lawListOrPromise === "function" ? await lawListOrPromise() : await lawListOrPromise;
    try {
        for (const lawInfo of lawList) {
            const item = LawQueryItem.fromLawInfo(lawInfo, dataPath, textFetcher);
            yieldCount++;
            const now = new Date();
            if (now.getTime() - lastMessageTime.getTime() > 1000) {
                console.info(`   << source:\t⌛ running...\t(${yieldCount.toString().padStart(4, " ")}/${lawList.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawList.length * 100)}%\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }

            try {
                yield item;
            } finally {
                if (symbolFinalyzeQueryItem in item) {
                    (item as unknown as QueryItem)[symbolFinalyzeQueryItem]();
                }
            }
        }
    } finally {
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        console.info(`   << source:\t${yieldCount === lawList.length ? "✓ completed." : "🚧 stopped. "}\t(${yieldCount.toString().padStart(4, " ")}/${lawList.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawList.length * 100)}%\tin ${msec} msec)`);
    }
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
