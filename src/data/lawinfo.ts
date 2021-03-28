import { reLawnum } from "@coresrc/util";

export type LawInfoListItem = [
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Enforced: boolean,
    Path: string,
    XmlName: string,
    ReferencingLawNums: string[],
    ReferencedLawNums: string[],
]

export interface BaseLawInfo {
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Enforced: boolean,
    Path: string,
    XmlName: string,
}
export class LawInfo implements BaseLawInfo {
    public ReferencingLawNums: Set<string> = new Set();
    public ReferencedLawNums: Set<string> = new Set();
    public constructor(
        public LawID: string,
        public LawNum: string,
        public LawTitle: string,
        public Enforced: boolean,
        public Path: string,
        public XmlName: string,
    ) {}

    public toTuple(): LawInfoListItem {
        return [
            this.LawID,
            this.LawNum,
            this.LawTitle,
            this.Enforced,
            this.Path,
            this.XmlName,
            Array.from(this.ReferencingLawNums),
            Array.from(this.ReferencedLawNums),
        ];
    }

    public static fromBaseLawInfo(baseLawInfo: BaseLawInfo): LawInfo {
        const {
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        } = baseLawInfo;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        );

        return lawInfo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static getHeader() {
        return [
            "LawID",
            "LawNum",
            "LawTitle",
            "Enforced",
            "Path",
            "XmlName",
            "ReferencingLawNums",
            "ReferencedLawNums",
        ] as const;
    }

    public static fromTuple(tuple: LawInfoListItem): LawInfo {
        const [
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
            ReferencingLawNums,
            ReferencedLawNums,
        ] = tuple;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Enforced,
            Path,
            XmlName,
        );
        for (const v of ReferencingLawNums) lawInfo.ReferencingLawNums.add(v);
        for (const v of ReferencedLawNums) lawInfo.ReferencedLawNums.add(v);

        return lawInfo;
    }

    public addReferencingLawNums(xml: string): void {
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        for (const m of xml.match(new RegExp(reLawnum, "g")) || []) {
            if (m !== this.LawNum) this.ReferencingLawNums.add(m);
        }
    }
}

export interface LawList {
    header: ReturnType<typeof LawInfo["getHeader"]>,
    body: LawInfoListItem[],
}

export class LawListGenerator {
    protected lawInfos: LawInfo[] = [];
    protected lawInfoMap: Map<string, LawInfo[]> = new Map<string, LawInfo[]>();

    public add(lawInfo: LawInfo): void {
        this.lawInfos.push(lawInfo);
        if (!this.lawInfoMap.has(lawInfo.LawNum)) this.lawInfoMap.set(lawInfo.LawNum, []);
        this.lawInfoMap.get(lawInfo.LawNum)?.push(lawInfo);
    }

    public setReferences(): void {
        for (const referencingLawInfo of this.lawInfos) {
            for (const lawnum of Array.from(referencingLawInfo.ReferencingLawNums)) {
                const referencedLawInfos = this.lawInfoMap.get(lawnum);
                if (referencedLawInfos) {
                    for (const referencedLawInfo of referencedLawInfos) {
                        referencedLawInfo.ReferencedLawNums.add(referencingLawInfo.LawNum);
                    }
                } else {
                    referencingLawInfo.ReferencingLawNums.delete(lawnum);
                }
            }
        }
    }

    public getList(): LawList {
        return {
            header: LawInfo.getHeader(),
            body: this.lawInfos.map(lawinfo => lawinfo.toTuple()),
        };
    }
}
