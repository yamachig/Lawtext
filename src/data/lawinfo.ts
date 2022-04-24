import { ptnLawNum } from "../law/num";

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

    /** この法令が参照している法令の法令番号の一覧 */
    public ReferencingLawNums: Set<string> = new Set();

    /** この法令を参照している法令の法令番号の一覧 */
    public ReferencedLawNums: Set<string> = new Set();

    /** 法令ID */
    public LawID: string;

    /** 法令番号 */
    public LawNum: string;

    /** 法令名 */
    public LawTitle: string;

    /** 施行済みかどうか */
    public Enforced: boolean;

    public Path: string;

    public XmlName: string;

    public constructor(
        LawID: string,
        LawNum: string,
        LawTitle: string,
        Enforced: boolean,
        Path: string,
        XmlName: string,
    ) {
        this.LawID = LawID;
        this.LawNum = LawNum;
        this.LawTitle = LawTitle;
        this.Enforced = Enforced;
        this.Path = Path;
        this.XmlName = XmlName;
    }

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

    public toBaseLawInfo(): BaseLawInfo {
        return {
            LawID: this.LawID,
            LawNum: this.LawNum,
            LawTitle: this.LawTitle,
            Enforced: this.Enforced,
            Path: this.Path,
            XmlName: this.XmlName,
        };
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
        for (const m of xml.match(new RegExp(ptnLawNum, "g")) || []) {
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
