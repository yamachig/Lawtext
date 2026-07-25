import { assertNever } from "../util";
import type { EL } from "../node/el";
import { LawInfo } from "./lawinfo";
import type { Loader } from "./loaders/common";
import { FetchElawsLoader, fetchLawData } from "./loaders/FetchElawsLoader";
import type { WorkersPool } from "./workersPool";
import { elementToEL } from "../node/el/xmlToEL";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("@xmldom/xmldom").DOMParser;
const domParser = new DOMParser();

interface CoreQueryCriteria<TItem> {
    match: (item: TItem) => boolean | Promise<boolean>;
}

type QueryCriteria<TItem> = CoreQueryCriteria<TItem> | CoreQueryCriteria<TItem>["match"];

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
 * Options for {@link Query}.
 *
 * {@link Query} のオプション項目
 */
export interface QueryOptions {
    /**
     * Whether to show progress message.
     *
     * 進捗状況を表示するかどうか。
     */
    showProgress: boolean;
}

const defaultQueryOptions = (): QueryOptions => ({
    showProgress: true,
});

/**
 * The query object that represents a source list and a filtering criteria.
 *
 * フィルタ条件と検索元リストを表すクエリオブジェクト。
 *
 * @example
 * A `Query` works as an async generator.
 *
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
> implements AsyncIterable<TItem> {

    public population: AsyncIterable<TItem>;
    public criteria: CoreQueryCriteria<TItem> | null;
    public options: QueryOptions;

    /**
     * Instanciate a `Query`.
     * @param population - a source list
     * @param criteria - a filtering criteria
     * @param options - options
     */
    public constructor(
        population: AsyncIterable<TItem>,
        criteria: QueryCriteria<TItem> | null,
        options?: Partial<QueryOptions>,
    ) {
        this.population = population;
        if (criteria === null) {
            this.criteria = criteria;
        } else if ("match" in criteria) {
            this.criteria = criteria;
        } else if (typeof criteria === "function") {
            this.criteria = { match: criteria };
        } else {
            throw assertNever(criteria);
        }
        this.options = { ...defaultQueryOptions(), ...options };
    }

    protected new(
        population: AsyncIterable<TItem>,
        criteria: QueryCriteria<TItem> | null,
        overrideOptions?: Partial<QueryOptions>,
    ): this {
        return new Query(population, criteria, { ...this.options, ...overrideOptions }) as this;
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
     *
     * フィルタ後の要素ごとに関数を実行します。
     *
     * @param func - a function to be called for each filtered item <br/> 要素ごとに実行される関数
     * @param criteria - an additional criteria applied after filtering / 関数実行後に適用するフィルタ条件
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that yields items returned by `func` <br/> `func` の返り値を列挙する新しい `Query`
     */
    public map<T, TRet=T extends(void | undefined) ? never : T>(
        func: (item: TItem) => T | Promise<T>,
        criteria: QueryCriteria<TRet> | null = null,
        options?: Partial<QueryOptions>,
    ): Query<Awaited<TRet>> {
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
            criteria,
            options,
        );
    }

    public mapWorkers<T, TRet=T extends(void | undefined) ? never : T>(
        workersPool: WorkersPool<TItem, TRet>,
        criteria: QueryCriteria<TRet> | null = null,
        options?: Partial<QueryOptions>,
    ): Query<Awaited<TRet>> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Query(
            (async function *() {
                for await (const [, item, value] of workersPool.run(self)) {
                    if (value === undefined) {
                        throw TypeError(`Query.mapWorkers: the WorkersPool returned an undefined. Please check the definition of the function. (First occurance: ${item})`);
                    }
                    yield value as unknown as TRet;
                }
            })(),
            criteria,
            options,
        );
    }

    /**
     * Apply a function for each filtered item and iterate the merged object with the returned and original object.
     *
     * フィルタ後の要素ごとに関数を実行し、返り値と元の要素のプロパティをマージしたオブジェクトを列挙します。
     *
     * @param func - a function to be called for each filtered item <br/> 要素ごとに実行される関数
     * @param criteria - an additional criteria applied after merge / マージ後に適用するフィルタ条件
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that yields merged objects <br/> マージされたオブジェクトを列挙する新しい `Query`
     */
    public assign<T>(
        func: (item: TItem) => T | Promise<T>,
        criteria: QueryCriteria<T extends (void | undefined) ? never : (T & TItem)> | null = null,
        options?: Partial<QueryOptions>,
    ): Query<T extends (void | undefined) ? never : (T & TItem)> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return this.new(
            (async function *() {
                for await (const item of self) {
                    const value = await func(item);
                    if (value === undefined) {
                        throw TypeError(`Query.assign: the mapped function (${func}) returned an undefined. Please check the definition of the function. (First occurance: ${item})`);
                    }
                    yield Object.setPrototypeOf({ ...item, ...value }, Object.getPrototypeOf(item));
                }
            })(),
            criteria as QueryCriteria<TItem> | null,
            options,
        ) as unknown as Query<T extends (void | undefined) ? never : (T & TItem)>;
    }

    /**
     * Apply an additional filter.
     *
     * フィルタを追加します。
     *
     * @param criteria - an additional criteria / 追加するフィルタ条件
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that applies `criteria` to the filtered items of the original `Query` <br/> フィルタ後の項目を検索元とし、`criteria` を検索条件とする新しい `Query`
     */
    public filter(
        criteria: QueryCriteria<TItem> | null,
        options?: Partial<QueryOptions>,
    ): this {
        return this.new(
            this[Symbol.asyncIterator](),
            criteria,
            options,
        );
    }

    /**
     * Yield while `func` returns `true`.
     *
     * `func` が `true` を返す間、列挙を続けます。
     *
     * @param func - a function to be called for each filtered item. Returning `false` terminates the iteration. <br/>要素ごとに実行される関数。`false`を返すと列挙を停止します。
     * @param yieldLast - whether to return the item that caused `func` returned `false` <br/>`func`が`false`を返す要因となった要素を出力するかどうか
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that yields while `func` returns `true`<br/>`func` が `true` を返す間列挙を続ける新しい `Query`
     */
    public while(
        func: (item: TItem) => boolean | Promise<boolean>,
        yieldLast = false,
        options?: Partial<QueryOptions>,
    ): this {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return this.new(
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
            options,
        );
    }

    /**
     * Skip specified count.
     *
     * 指定した件数スキップします。
     *
     * @param count - count to skip<br/>スキップする件数
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that yields after skipping specified count.<br/>指定した件数のスキップ後列挙を続ける新しい `Query`
     */
    public skip(
        count: number,
        options?: Partial<QueryOptions>,
    ): this {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return this.new(
            (async function *() {
                let remain = count;
                for await (const item of self) {
                    if (remain > 0) {
                        remain--;
                        continue;
                    }
                    yield item;
                }
            })(),
            null,
            options,
        );
    }

    /**
     * Yield until it reaches the maximum count.
     *
     * 出力の最大件数を設定します。
     *
     * @param max - the maximum count<br/>最大件数
     * @param options - options which override the original ones / 上書きするオプション項目
     * @returns - a new `Query` that yields until it reaches the maximum count.<br/>最大件数に達するまで列挙を続ける新しい `Query`
     */
    public limit(
        max: number,
        options?: Partial<QueryOptions>,
    ): this {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return this.new(
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
            options,
        );
    }

    /**
     * Yield a property of each item.
     *
     * 特定のプロパティの内容を一つ抜き出して列挙します。
     *
     * @param key - the key of a property to be picked<br/>抜き出すプロパティのキー
     * @returns - a new `Query` that yields the picked property<br/>抜き出したプロパティの内容を列挙する新しい `Query`
     */
    public property<K extends keyof TItem>(key: K): Query<Awaited<TItem[K]>> {
        return this.map(item => item[key]);
    }

    /**
     * Pick properties of each item.
     *
     * 特定のプロパティ以外のプロパティを削除したオブジェクトを列挙します。
     *
     * @param keys - the keys of properties to be picked<br/>抜き出すプロパティのキー
     * @returns - a new `Query` that yields the objects with the picked properties<br/>プロパティを抜き出した新しいオブジェクトの内容を列挙する新しい `Query`
     */
    public pick<K extends keyof TItem>(...keys: K[]): Query<Awaited<Pick<TItem, K>>> {
        return this.map(item => {
            const picked = {} as Pick<TItem, K>;
            for (const key of keys) {
                picked[key] = item[key];
            }
            return picked;
        });
    }

    /**
     * Generate an array from the `Query`. Running this function will invoke the whole iteration process of the `Query`.
     *
     * `Query` から配列を生成します。この関数を実行すると `Query` の列挙を最後まで実行します。
     *
     * @param options
     *
     * - `options.preserveCache <boolean>`: whether to suggest the `Query` to preserve the cached data for each item, which normally will be cleared after yield (default: `false`)<br/>`Query`にキャッシュされたデータを削除せずそのまま残すかどうかを指示します。
     *
     * @returns - a `Promise` that resolves a generated array<br/>生成された配列を返す `Promise`
     */
    public async toArray(options: {preserveCache: boolean} = { preserveCache: false }): Promise<TItem[]> {
        const arr: TItem[] = [];
        await this.forEach(item => {
            if (options.preserveCache && item && (typeof item === "object") && (symbolDoNotFinalize in item)) {
                (item[symbolDoNotFinalize as keyof TItem] as unknown as boolean) = true;
            }
            arr.push(item);
        });
        return arr;
    }

    /**
     * Invoke `func` for each filtered item. Running this function will invoke the whole iteration process of the `Query`.
     *
     * 列挙された要素ごとに `func` を実行します。この関数を実行すると `Query` の列挙を最後まで実行します。
     *
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
                if (this.options.showProgress) console.info(`Query progress:\t⌛ running...\t(${matchCount.toString().padStart(4, " ")} matches\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }
            if (item && typeof item === "object" && symbolFinalyzeQueryItem in item) {
                (item as unknown as QueryItem)[symbolFinalyzeQueryItem]();
            }
        }
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        if (this.options.showProgress) console.info(`Query progress:\t✓ completed.\t(${matchCount.toString().padStart(4, " ")} matches\tin ${msec} msec)`);
    }

}

interface Validator<T> {
    typeDescription: string,
    default: () => T,
    validate: (v: unknown) => v is T,
}

type Validators<TArgs> = {
    [K in keyof Required<TArgs>]: Validator<TArgs[K]>
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
    LawID?: RegExp,
    /** 法令番号のマッチに用いる正規表現 */
    LawNum?: RegExp,
    /** 法令名のマッチに用いる正規表現 */
    LawTitle?: RegExp,
    /** 施行済み法令かどうか */
    Enforced?: boolean,

    Path?: RegExp,
    XmlName?: RegExp,

    /** この法令が参照している法令の法令番号のマッチに用いる正規表現 */
    ReferencingLawNum?: RegExp,
    /** この法令を参照している法令の法令番号のマッチに用いる正規表現 */
    ReferencedLawNum?: RegExp,

    /** 法令XML文字列のマッチに用いる正規表現 */
    xml?: RegExp,
    /** 法令XMLのDOMを受け取り、マッチしたかどうかを返す関数。 */
    document?: (document: XMLDocument) => boolean | Promise<boolean>,
    el?: (el: EL) => boolean | Promise<boolean>,
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

export type LawCriteria<TLawQueryItem extends LawQueryItem = LawQueryItem> = QueryCriteria<TLawQueryItem> | LawCriteriaArgs;

export class BaseLawCriteria implements CoreQueryCriteria<LawQueryItem> {

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

/**
 * {@link LawQuery} で列挙される、法令を表すオブジェクト。
 */
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

    protected static initialCache = () => ({
        imageData: null as Uint8Array | null,
        xml: null as string | null,
        document: null as XMLDocument | null,
        el: null as EL | null,
    });

    protected _cache = LawQueryItem.initialCache();

    /**
     * e-Gov 法令APIから法令XMLを取得します。
     * @returns 法令XML
     */
    public async getXML(): Promise<string | null> {
        if (this._cache.xml === null) {
            if (this.loader === null) throw Error("Loader not specified");
            if (this.loader instanceof FetchElawsLoader) {
                const elawsLawData = await fetchLawData(this.LawID);
                this._cache.xml = elawsLawData.xml;
                this._cache.imageData = elawsLawData.imageData;
            } else {
                this._cache.xml = (await this.loader.loadLawXMLStructByInfo(this)).xml;
            }
        }
        return this._cache.xml;
    }

    /**
     * e-Gov 法令APIから法令XMLを取得し、`XMLDocument` として返します。
     * @returns 法令XMLの `XMLDocument`
     */
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
            this._cache.el = elementToEL(doc.documentElement);
        }
        return this._cache.el ;
    }

    public [symbolFinalyzeQueryItem](): void {
        if (this[symbolDoNotFinalize]) return;
        this._cache = LawQueryItem.initialCache();
    }
    public [symbolDoNotFinalize] = false;

    /**
     * 「法令名（法令番号）」の形式の文字列を返します。未施行の場合は文頭に「【未施行】」を付します。
     * @returns 文字列
     */
    public override toString(): string {
        return `${this.LawID} ${this.Enforced ? "" : "【未施行】"}${this.LawNum}「${this.LawTitle}」`;
    }
}

async function *getLawQueryPopulationWithProgress(
    lawInfosOrPromise:
        | LawInfo[]
        | Promise<LawInfo[]>
        | (() => LawInfo[] | Promise<LawInfo[]>),
    loader: Loader | null,
    options: QueryOptions,
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
                if (options.showProgress) console.info(`   << source:\t⌛ running...\t(${yieldCount.toString().padStart(4, " ")}/${lawInfos.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawInfos.length * 100)}%\tin ${now.getTime() - startTime.getTime()} msec)`);
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
        if (options.showProgress) console.info(`   << source:\t${yieldCount === lawInfos.length ? "✓ completed." : "🚧 stopped. "}\t(${yieldCount.toString().padStart(4, " ")}/${lawInfos.length.toString().padStart(4, " ")}=${Math.floor(yieldCount / lawInfos.length * 100)}%\tin ${msec} msec)`);
    }
}

/**
 * Lawtext query の法令検索を行う {@link Query} の派生クラス。ここに列挙されているもの以外のクラスメンバーについては {@link Query} を参照してください。
 */
export class LawQuery<
    TItem extends LawQueryItem = LawQueryItem,
> extends Query<TItem> {

    public constructor(
        population: AsyncIterable<TItem>,
        criteria: LawCriteria<TItem> | null,
        options?: Partial<QueryOptions>,
    ) {
        let this_criteria: QueryCriteria<TItem> | null;
        if (criteria === null) {
            this_criteria = criteria;
        } else if ("match" in criteria) {
            this_criteria = criteria;
        } else if (typeof criteria === "function") {
            this_criteria = criteria;
        } else {
            this_criteria = new BaseLawCriteria(criteria);
        }
        super(
            population,
            this_criteria,
            options,
        );
    }

    protected override new(
        population: AsyncIterable<TItem>,
        criteria: LawCriteria<TItem> | null,
        overrideOptions?: Partial<QueryOptions>,
    ): this {
        return new LawQuery(population, criteria, { ...this.options, ...overrideOptions }) as this;
    }

    public static fromFetchInfo(
        loader: Loader,
        criteria: LawCriteria<LawQueryItem> | null,
        options?: Partial<QueryOptions>,
    ): LawQuery {
        const fullOptions = { ...defaultQueryOptions(), ...options };
        return new LawQuery(
            getLawQueryPopulationWithProgress(
                (async () => {
                    const { lawInfos: lawList } = await loader.cacheLawListStruct();
                    return lawList;
                }),
                loader,
                fullOptions,
            ),
            criteria,
            fullOptions,
        );
    }

    public override filter(criteria: LawCriteria<TItem> | null): this {
        return this.new(
            this[Symbol.asyncIterator](),
            criteria,
        );
    }

    public override assign<T>(
        func: (item: TItem) => T | Promise<T>,
        criteria: LawCriteria<T extends (void | undefined) ? never : (T & TItem)> | null = null,
        options?: Partial<QueryOptions>,
    ): LawQuery<T extends (void | undefined) ? never : (T & TItem)> {
        return super.assign(
            func,
            criteria as CoreQueryCriteria<TItem>,
            options,
        ) as unknown as LawQuery<T extends (void | undefined) ? never : (T & TItem)>;
    }

    /**
     * 法令XMLのDOMを取得して追加したオブジェクトを列挙します。
     * @param ensure - 法令XMLが取得できたもののみを列挙するかどうか（デフォルト: `true`）
     * @param options - 上書きするオプション項目
     * @returns - 法令XMLのDOMを `document` プロパティとして追加したオブジェクトを列挙する新しい `Query`
     */
    public assignDocument<TEnsure extends boolean=true>(
        ensure: TEnsure = true as TEnsure,
        options?: Partial<QueryOptions>,
    ):
        LawQuery<TItem & {document: TEnsure extends true ? XMLDocument : (XMLDocument | null) }> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return this.new(
            (async function *() {
                for await (const item of self) {
                    let document: XMLDocument | null = null;
                    try {
                        document = await item.getDocument();
                    } catch (e) {
                        console.error(e);
                    }
                    if (!ensure || document !== null) {
                        yield Object.setPrototypeOf({ ...item, document }, Object.getPrototypeOf(item));
                    }
                }
            })(),
            null,
            options,
        ) as unknown as LawQuery<TItem & {document: TEnsure extends true ? XMLDocument : (XMLDocument | null) }>;
    }
}
