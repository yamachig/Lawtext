import { LawInfo } from "./lawlist";

abstract class QueryCriteria<TItem, TArgs extends Record<string, unknown> = Record<string, never>> {
    public constructor(
        public args: TArgs,
    ) { }
    public abstract match(item: TItem): boolean;
}

class AllCriteria<TItem> extends QueryCriteria<TItem> {
    public constructor() { super({}); }
    public match() { return true; }
}

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T, void, undefined>;
}

export class Query<
    TItem,
    TCriteria = QueryCriteria<TItem, Record<string, never>>,
    TArgs extends Record<string, unknown> = TCriteria extends QueryCriteria<TItem, infer U> ? U : never,
> implements AsyncIterable<TItem> {
    public constructor (
        public population: AsyncIterable<TItem>,
        public criteria: QueryCriteria<TItem, TArgs>,
    ) {}
    async *[Symbol.asyncIterator](): AsyncGenerator<TItem, void, undefined> {
        for await (const item of this.population) {
            if (!this.criteria.match(item)) continue;
            yield item;
        }
    }
    public map<T>(func: (item: TItem) => T extends undefined ? never : T): Query<T> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return new Query(
            (async function *() {
                for await (const item of self) {
                    const value = func(item);
                    if (value === undefined) {
                        throw TypeError(`Query.map: the mapped function (${func}) returned an undefined. Please check the definition of the function. (First occurance: ${item})`);
                    }
                    yield value;
                }
            })(),
            new AllCriteria<TItem>(),
        );
    }
    public async toArray(): Promise<TItem[]> {
        const arr: TItem[] = [];
        const startTime = new Date();
        let lastMessageTime = startTime;
        let matchCount = 0;
        for await (const item of this) {
            matchCount++;
            arr.push(item);
            const now = new Date();
            if (now.getTime() - lastMessageTime.getTime() > 1000) {
                console.info(`Query.toArray:\t⌛ running...\t(${matchCount} matches\tin ${now.getTime() - startTime.getTime()} msec)`);
                lastMessageTime = now;
            }
        }
        const now = new Date();
        const msec = now.getTime() - startTime.getTime();
        if (msec > 1000) {
            console.info(`Query.toArray:\t✓ completed.\t(${matchCount} matches\tin ${msec} msec)`);
        }
        return arr;
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
export class LawCriteria extends QueryCriteria<LawQueryItem, LawCriteriaArgs> {
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
        super({ ...defaults, ...args });
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
    public toString(): string {
        return `${this.LawID} ${this.LawNum}「${this.LawTitle}」`;
    }
}

export class LawQuery
    extends Query<LawQueryItem, LawCriteria> {
    public constructor (
        population: AsyncIterable<LawQueryItem>,
        criteriaOrArgs: LawCriteria | LawCriteriaArgs,
    ) {
        super(
            population,
            criteriaOrArgs instanceof LawCriteria
                ? criteriaOrArgs
                : new LawCriteria(criteriaOrArgs),
        );
    }
    public static fromPromiseLawInfos(
        pLawList: Promise<LawInfo[]>,
        criteriaOrArgs: LawCriteria | LawCriteriaArgs,
    ): LawQuery {
        return new LawQuery(
            (async function *() {
                const startTime = new Date();
                let lastMessageTime = startTime;
                let matchCount = 0;
                const lawList = await pLawList;
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
            })(),
            criteriaOrArgs,
        );
    }
}
