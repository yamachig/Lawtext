import { showLawXML } from "./actions/temp_law";
import { LawCriteria, LawQuery } from "@coresrc/data/query";
import { traceTitles } from "./law_util";
import { elawsLoader, storedLoader } from "./lawdata/loaders";

/**
 * ブラウザのコンソールから利用可能なオブジェクトです。
 */
export const lawtext = {

    /**
     * `Element` の親をさかのぼって条番号や項番号などの階層を取得します。
     * @param el - 検索対象の `Element`
     * @returns - 条番号などを羅列した配列
     */
    traceTitles: (el: Element): string[] => traceTitles(el),

    /**
     * 法令XMLを新しいウィンドウのLawtextで表示します。
     * @param xml - 表示する法令XML
     */
    showLawXML: (xml: string): void => showLawXML(xml),

    /**
     * 保存されたオフライン用データを用いてLawtext queryを実行します。
     * @param criteria - 法令のフィルタに用いる {@link LawCriteriaArgs}。`null` を設定するとフィルタを行わず全ての項目を列挙します。
     * @returns - フィルタを適用した{@link LawQuery}。
     */
    query: (criteria: LawCriteria | null = null): LawQuery =>
        LawQuery.fromFetchInfo(storedLoader, criteria),

    /**
     * e-Gov 法令APIを用いてLawtext queryを実行します。
     * @param criteria - 法令のフィルタに用いる {@link LawCriteriaArgs}。`null` を設定するとフィルタを行わず全ての項目を列挙します。
     * @returns - フィルタを適用した{@link Query}。
     */
    queryViaAPI: (criteria: LawCriteria | null = null): LawQuery => {
        console.warn("クエリの実行に e-Gov 法令API を使用します。時間がかかる場合があります。");
        return LawQuery.fromFetchInfo(elawsLoader, criteria);
    },
};

export default {
    lawtext,
};
