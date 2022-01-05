import { assert } from "chai";
import { LineType } from "../../node/cst/line";
import { parse } from "../cst/parse";
import { toVirtualLines, VirtualLineType, VirtualOnlyLineType as VirtualL } from "./virtualLine";

describe("Test virtualLine", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const target: [
            expected: [
                lineType: LineType,
                rawIndentDepth: number,
                virtualLineType: VirtualLineType,
                virtualIndentDepth: number,
                indentChange: number,
            ],
            input: string,
        ][] = [
            [[LineType.OTH, 0, LineType.OTH, 0, +0], "行政手続法"],
            [[LineType.OTH, 0, LineType.OTH, 0, +0], "（平成五年法律第八十八号）"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.TOC, 0, LineType.TOC, 0, +0], "目次"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +1], "  第一章　総則（第一条―第四条）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第二章　申請に対する処分（第五条―第十一条）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第三章　不利益処分"],
            [[LineType.ARG, 2, VirtualL.TAG, 2, +1], "    第一節　通則（第十二条―第十四条）"],
            [[LineType.ARG, 2, VirtualL.TAG, 2, +0], "    第二節　聴聞（第十五条―第二十八条）"],
            [[LineType.ARG, 2, VirtualL.TAG, 2, +0], "    第三節　弁明の機会の付与（第二十九条―第三十一条）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, -1], "  第四章　行政指導（第三十二条―第三十六条の二）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第四章の二　処分等の求め（第三十六条の三）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第五章　届出（第三十七条）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第六章　意見公募手続等（第三十八条―第四十五条）"],
            [[LineType.ARG, 1, VirtualL.TAG, 1, +0], "  第七章　補則（第四十六条）"],
            [[LineType.SPR, 1, VirtualL.TSP, 1, +0], "  附則"],
            [[LineType.BNK, 0, LineType.BNK, 1, +0], ""],
            [[LineType.ARG, 3, LineType.ARG, 0, -1], "      第三章　不利益処分"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.ARG, 4, LineType.ARG, 0, +0], "        第二節　聴聞"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 1, VirtualL.TTL, 0, +0], "  （聴聞の通知の方式）"],
            [[LineType.ART, 0, LineType.ART, 0, +0], "第十五条　行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。"],
            [[LineType.PIT, 1, LineType.PIT, 1, +1], "  一　予定される不利益処分の内容及び根拠となる法令の条項"],
            [[LineType.PIT, 1, LineType.PIT, 1, +0], "  二　不利益処分の原因となる事実"],
            [[LineType.PIT, 1, LineType.PIT, 1, +0], "  三　聴聞の期日及び場所"],
            [[LineType.PIT, 1, LineType.PIT, 1, +0], "  四　聴聞に関する事務を所掌する組織の名称及び所在地"],
            [[LineType.PIT, 0, LineType.PIT, 0, -1], "２　前項の書面においては、次に掲げる事項を教示しなければならない。"],
            [[LineType.PIT, 1, LineType.PIT, 1, +1], "  一　聴聞の期日に出頭して意見を述べ、及び証拠書類又は証拠物（以下「証拠書類等」という。）を提出し、又は聴聞の期日への出頭に代えて陳述書及び証拠書類等を提出することができること。"],
            [[LineType.PIT, 1, LineType.PIT, 1, +0], "  二　聴聞が終結する時までの間、当該不利益処分の原因となる事実を証する資料の閲覧を求めることができること。"],
            [[LineType.PIT, 0, LineType.PIT, 0, -1], "３　行政庁は、不利益処分の名あて人となるべき者の所在が判明しない場合においては、第一項の規定による通知を、その者の氏名、同項第三号及び第四号に掲げる事項並びに当該行政庁が同項各号に掲げる事項を記載した書面をいつでもその者に交付する旨を当該行政庁の事務所の掲示場に掲示することによって行うことができる。この場合においては、掲示を始めた日から二週間を経過したときに、当該通知がその者に到達したものとみなす。"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.ARG, 3, LineType.ARG, 0, +0], "      第七章　補則"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 1, VirtualL.TTL, 0, +0], "  （地方公共団体の措置）"],
            [[LineType.ART, 0, LineType.ART, 0, +0], "第四十六条　地方公共団体は、第三条第三項において第二章から前章までの規定を適用しないこととされた処分、行政指導及び届出並びに命令等を定める行為に関する手続について、この法律の規定の趣旨にのっとり、行政運営における公正の確保と透明性の向上を図るため必要な措置を講ずるよう努めなければならない。"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.SPR, 3, LineType.SPR, 0, +0], "      附　則"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 1, VirtualL.TTL, 0, +0], "  （施行期日）"],
            [[LineType.PIT, 0, LineType.PIT, 0, +0], "１　この法律は、公布の日から起算して一年を超えない範囲内において政令で定める日から施行する。"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 1, VirtualL.TTL, 0, +0], "  （経過措置）"],
            [[LineType.PIT, 0, LineType.PIT, 0, +0], "２　この法律の施行前に第十五条第一項又は第三十条の規定による通知に相当する行為がされた場合においては、当該通知に相当する行為に係る不利益処分の手続に関しては、第三章の規定にかかわらず、なお従前の例による。"],
            [[LineType.PIT, 0, LineType.PIT, 0, +0], "３　この法律の施行前に、届出その他政令で定める行為（以下「届出等」という。）がされた後一定期間内に限りすることができることとされている不利益処分に係る当該届出等がされた場合においては、当該不利益処分に係る手続に関しては、第三章の規定にかかわらず、なお従前の例による。"],
            [[LineType.PIT, 0, LineType.PIT, 0, +0], "４　前二項に定めるもののほか、この法律の施行に関して必要な経過措置は、政令で定める。"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.SPR, 3, LineType.SPR, 0, +0], "      附　則（平成一八年六月一四日法律第六六号）　抄"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 0, LineType.OTH, 0, +0], "この法律は、平成十八年証券取引法改正法の施行の日から施行する。"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.SPR, 3, LineType.SPR, 0, +0], "      附　則（平成二九年三月三一日法律第四号）　抄"],
            [[LineType.BNK, 0, LineType.BNK, 0, +0], ""],
            [[LineType.OTH, 1, VirtualL.TTL, 0, +0], "  （施行期日）"],
            [[LineType.ART, 0, LineType.ART, 0, +0], "第一条　この法律は、平成二十九年四月一日から施行する。ただし、次の各号に掲げる規定は、当該各号に定める日から施行する。"],
            [[LineType.PIT, 1, LineType.PIT, 1, +1], "  一～四　略"],
            [[LineType.PIT, 1, LineType.PIT, 1, +0], "  五　次に掲げる規定　平成三十年四月一日"],
            [[LineType.PIT, 2, LineType.PIT, 2, +1], "    イ～ハ　略"],
            [[LineType.PIT, 2, LineType.PIT, 2, +0], "    ニ　第八条の規定（同条中国税通則法第十九条第四項第三号ハの改正規定、同法第三十四条の二（見出しを含む。）の改正規定及び同法第七十一条第二項の改正規定を除く。）並びに附則第四十条第二項及び第三項、第百五条、第百六条、第百八条から第百十四条まで、第百十八条、第百二十四条、第百二十五条、第百二十九条から第百三十三条まで、第百三十五条並びに第百三十六条の規定"],
            [[LineType.BNK, 0, LineType.BNK, 2, +0], ""],
        ];
        const lastIndentChange = -2;

        const lawtext = target.map(([, input]) => input + "\r\n").join("");

        const lines = parse(lawtext).value;

        for (let i = 0; i < Math.max(lines.length, target.length); i += 5) {
            assert.deepStrictEqual(
                lines.slice(i, i + 5).map((line, index) => ({
                    index,
                    type: line.type,
                    rawIndentDepth: "indentDepth" in line ? line.indentDepth : 0,
                    text: line.text(),
                })),
                target.slice(i, i + 5).map(([[type, rawIndentDepth], input], index) => ({
                    index,
                    type,
                    rawIndentDepth,
                    text: input + "\r\n",
                })),
            );
        }

        const virtualLines = toVirtualLines(lines);

        const targetForComparizon: {type: VirtualLineType, virtualIndentDepth?: number, text?: string}[] = [];
        for (const [[,, virtualLineType, virtualIndentDepth, indentChange], input] of target) {
            if (indentChange > 0) {
                for (let i = 0; i < indentChange; i++) targetForComparizon.push({ type: VirtualL.IND });
            }
            if (indentChange < 0) {
                for (let i = 0; i < -indentChange; i++) targetForComparizon.push({ type: VirtualL.DED });
            }
            targetForComparizon.push({ type: virtualLineType, virtualIndentDepth, text: input + "\r\n" });
        }
        for (let i = 0; i < -lastIndentChange; i++) targetForComparizon.push({ type: VirtualL.DED });

        for (let i = 0; i < Math.max(virtualLines.length, target.length); i += 5) {
            assert.deepStrictEqual(
                virtualLines.slice(i, i + 5).map((vl, index) => {
                    if ("line" in vl) {
                        return {
                            index,
                            type: vl.type,
                            virtualIndentDepth: vl.virtualIndentDepth,
                            text: vl.line.text(),
                        };
                    } else {
                        return { index, type: vl.type };
                    }
                }),
                targetForComparizon.slice(i, i + 5).map((t, index) => ({
                    index,
                    ...t,
                })),
            );
        }
    });
});
