import { assertNever, EL, elementToJson } from "@coresrc/util";
import { LawInfo } from "./lawinfo";
import { Loader } from "./loaders/common";
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
const symbolDoNotFinalize = Symbol("symbolDoNotFinalize");
interface QueryItem {
    [symbolFinalyzeQueryItem]: () => void;
    [symbolDoNotFinalize]: boolean;
}

/**
 * The query object that represents a source list and a filtering criteria.
 * フィルタ条件と検索元リストを表すクエリオブジェクト。
 *
 * @example
 * A `Query` works as an async generator.
 * `Query` は async generator として使用できます。
 *
 * ```ts
 * const query = new Query(population, criteria);
 * for await (const item of query) {
 *     console.log(item);
 * }
 * ```
 */
export class Query<
    TItem,
    TBaseCriteriaOrNull extends BaseQueryCriteria<TItem> | null,
> implements AsyncIterable<TItem> {

    public population: AsyncIterable<TItem>;
    public criteria: TBaseCriteriaOrNull;

    /**
     * Instanciate a `Query`.
     * @param population - a source list
     * @param criteria - a filtering criteria
     */
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

    /**
     * Apply a function for each filtered item.
     * フィルタ後の要素ごとに関数を実行します。
     * @param func - a function to be called for each filtered item <br/> 要素ごとに実行される関数
     * @returns - a new `Query` that yields items returned by `func` <br/> `func` の返り値を列挙する新しい `Query`
     */
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

    /**
     * Apply an additional filter.
     * フィルタを追加します。
     * @param criteria - an additional criteria / 追加するフィルタ条件
     * @returns - a new `Query` that applies `criteria` to the filtered items of the original `Query` <br/> フィルタ後の項目を検索元とし、`criteria` を検索条件とする新しい `Query`
     */
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

    /**
     * Yield while `func` returns `true`.
     * `func` が `true` を返す間、列挙を続けます。
     * @param func - a function to be called for each filtered item. Returning `false` terminates the iteration. <br/>要素ごとに実行される関数。`false`を返すと列挙を停止します。
     * @param yieldLast - whether to return the item that caused `func` returned `false` <br/>`func`が`false`を返す要因となった要素を出力するかどうか
     * @returns - a new `Query` that yields while `func` returns `true`<br/>`func` が `true` を返す間列挙を続ける新しい `Query`
     */
    public while(func: (item: TItem) => boolean | Promise<boolean>, yieldLast = false): Query<TItem, null> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Query(
            (async function *() {
                for await (const item of self) {
                    const continuing = await func(item);
                    if (continuing) {
                        yield item;
                    } else {
                        if (yieldLast) yield item;
                        break;
                    }
                }
            })(),
            null,
        );
    }

    /**
     * Yield until it reaches the maximum count.
     * 出力の最大件数を設定します。
     * @param max - the maximum count<br/>最大件数
     * @returns - a new `Query` that yields until it reaches the maximum count.<br/>最大件数に達するまで列挙を続ける新しい `Query`
     */
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

    /**
     * Yield a property of each item.
     * 特定のプロパティの内容を一つ抜き出して列挙します。
     * @param key - the key of a property to be picked<br/>抜き出すプロパティのキー
     * @returns - a new `Query` that yields the picked property<br/>抜き出したプロパティの内容を列挙する新しい `Query`
     */
    public property<K extends keyof TItem>(key: K): Query<TItem[K], null> {
        return this.map(item => item[key]);
    }

    /**
     * Pick properties of each item.
     * 特定のプロパティ以外のプロパティを削除したオブジェクトを列挙します。
     * @param keys - the keys of properties to be picked<br/>抜き出すプロパティのキー
     * @returns - a new `Query` that yields the objects with the picked properties<br/>プロパティを抜き出した新しいオブジェクトの内容を列挙する新しい `Query`
     */
    public pick<K extends keyof TItem>(...keys: K[]): Query<Pick<TItem, K>, null> {
        return this.map(item => {
            const picked = {} as Pick<TItem, K>;
            for (const key of keys) {
                picked[key] = item[key];
            }
            return picked;
        });
    }

    /* eslint-disable tsdoc/syntax */
    /**
     * Generate an array from the `Query`. Running this function will invoke the whole iteration process of the `Query`.
     * `Query` から配列を生成します。この関数を実行すると `Query` の列挙を最後まで実行します。
     * @param options.preserveCache - whether to suggest the `Query` to preserve the cached data for each item, which normally will be cleared after yield (default: `false`)<br/>`Query`にキャッシュされたデータを削除せずそのまま残すかどうかを指示します。
     * @returns - a `Promise` that resolves a generated array<br/>生成された配列を返す `Promise`
     */
    /* eslint-enable tsdoc/syntax */
    public async toArray(options: {preserveCache: boolean} = { preserveCache: false }): Promise<TItem[]> {
        const arr: TItem[] = [];
        await this.forEach(item => {
            if (options.preserveCache && symbolDoNotFinalize in item) {
                (item[symbolDoNotFinalize as keyof TItem] as unknown as boolean) = true;
            }
            arr.push(item);
        });
        return arr;
    }

    /**
     * Invoke `func` for each filtered item. Running this function will invoke the whole iteration process of the `Query`.
     * 列挙された要素ごとに `func` を実行します。この関数を実行すると `Query` の列挙を最後まで実行します。
     * @param func - a function to be called for each item<br/>要素ごとに実行される関数
     */
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
            if (typeof item === "object" && symbolFinalyzeQueryItem in item) {
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

/**
 * Lawtext query の法令検索パラメータです。
 */
export interface LawCriteriaArgs {
    /** 法令IDのマッチに用いる正規表現 */
    LawID: RegExp | undefined,
    /** 法令番号のマッチに用いる正規表現 */
    LawNum: RegExp | undefined,
    /** 法令名のマッチに用いる正規表現 */
    LawTitle: RegExp | undefined,
    /** 施行済み法令かどうか */
    Enforced: boolean | undefined,

    Path: RegExp | undefined,
    XmlName: RegExp | undefined,

    /** この法令が参照している法令の法令番号のマッチに用いる正規表現 */
    ReferencingLawNum: RegExp | undefined,
    /** この法令を参照している法令の法令番号のマッチに用いる正規表現 */
    ReferencedLawNum: RegExp | undefined,

    /** 法令XML文字列のマッチに用いる正規表現 */
    xml: RegExp | undefined,
    /** 法令XMLのDOMを受け取り、マッチしたかどうかを返す関数。 */
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

export class LawQueryItem extends LawInfo implements QueryItem {
    public loader: Loader | null = null;
    public static fromLawInfo(lawInfo: LawInfo, loader: Loader | null): LawQueryItem {
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
        item.loader = loader;
        return item;
    }

    protected _cache = {
        xml: null as string | null,
        document: null as XMLDocument | null,
        el: null as EL | null,
    };

    public async getXML(): Promise<string | null> {
        if (this._cache.xml === null) {
            if (this.loader === null) throw Error("Loader not specified");
            this._cache.xml = await this.loader.loadLawXMLByInfo(this);
        }
        return this._cache.xml;
    }

    public async getDocument(): Promise<XMLDocument | null> {
        if (this._cache.document === null) {
            const xml = await this.getXML();
            if (xml === null) return null;
            this._cache.document = domParser.parseFromString(xml, "text/xml");
        }
        return this._cache.document;
    }

    public async getEl(): Promise<EL | null> {
        if (this._cache.el === null) {
            const doc = await this.getDocument();
            if (doc === null) return null;
            this._cache.el = elementToJson(doc.documentElement);
        }
        return this._cache.el ;
    }

    public [symbolFinalyzeQueryItem](): void {
        if (this[symbolDoNotFinalize]) return;
        this._cache = { xml: null, document: null, el: null };
    }
    public [symbolDoNotFinalize] = false;

    public toString(): string {
        return `${this.LawID} ${this.Enforced ? "" : "【未施行】"}${this.LawNum}「${this.LawTitle}」`;
    }
}

async function *getLawQueryPopulationWithProgress(
    lawInfosOrPromise:
        | LawInfo[]
        | Promise<LawInfo[]>
        | (() => LawInfo[] | Promise<LawInfo[]>),
    loader: Loader | null,
) {
    const startTime = new Date();
    let lastMessageTime = startTime;
    let yieldCount = 0;
    const lawInfos = typeof lawInfosOrPromise === "function" ? await lawInfosOrPromise() : await lawInfosOrPromise;
    try {
        for (const lawInfo of lawInfos) {
            const item = LawQueryItem.fromLawInfo(lawInfo, loader);
            yieldCount++;
            const now = new Date();
            if (now.getTime() - lastMessageTime.getTime() > 1000) {
                console.info(`   << source:\t⌛ running...\t(${yieldCount.toString().padStart(4, " ")}/${lawInfos.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawInfos.length * 100)}%\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }

            try {
                yield item;
            } finally {
                if (typeof item === "object" && symbolFinalyzeQueryItem in item) {
                    (item as unknown as QueryItem)[symbolFinalyzeQueryItem]();
                }
            }
        }
    } finally {
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        console.info(`   << source:\t${yieldCount === lawInfos.length ? "✓ completed." : "🚧 stopped. "}\t(${yieldCount.toString().padStart(4, " ")}/${lawInfos.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawInfos.length * 100)}%\tin ${msec} msec)`);
    }
}

/**
 * Lawtext query の法令検索を行う {@link Query} の派生クラス。メンバーメソッドなどについては {@link Query} を参照してください。
 */
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
        loader: Loader,
        criteria: LawCriteria<LawQueryItem, TCriteria>,
    ): LawQuery {
        return new LawQuery(
            getLawQueryPopulationWithProgress(
                (async () => {
                    const { lawInfos: lawList } = await loader.cacheLawListStruct();
                    return lawList;
                }),
                loader,
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
