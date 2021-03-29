import * as lawdata from "./actions/lawdata";
import { showLawXML } from "./actions/temp_law";
import { LawCriteria, LawQuery } from "@coresrc/data/query";

/**
 * ブラウザのコンソールから利用可能なオブジェクトです。
 */
export const lawtext = {

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
    query: (criteria: LawCriteria = null): LawQuery =>
        LawQuery.fromFetchInfo(lawdata.storedLoader, criteria),

    /**
     * e-Gov 法令APIを用いてLawtext queryを実行します。
     * @param criteria - 法令のフィルタに用いる {@link LawCriteriaArgs}。`null` を設定するとフィルタを行わず全ての項目を列挙します。
     * @returns - フィルタを適用した{@link Query}。
     */
    queryViaAPI: (criteria: LawCriteria = null): LawQuery => {
        console.warn("クエリの実行に e-Gov 法令API を使用します。時間がかかる場合があります。");
        return LawQuery.fromFetchInfo(lawdata.elawsLoader, criteria);
    },
};

export default {
    lawtext,
};
