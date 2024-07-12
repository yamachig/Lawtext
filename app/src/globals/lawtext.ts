/**
 * ブラウザのコンソールから `lawtext` オブジェクトのプロパティとして利用可能となる項目です。
 * @module
 */

import * as temp_law from "@appsrc/actions/temp_law";
import * as coreQuery from "./coreQuery";
import * as law_util from "@appsrc/law_util";
import { elawsLoader, storedLoader } from "@appsrc/lawdata/loaders";
import type { LawInfo } from "lawtext/dist/src/data/lawinfo";
import * as _lawUtil from "lawtext/dist/src/law/std";
import type { Loader } from "lawtext/dist/src/data/loaders/common";

/**
 * `lawtext.law.lawUtil` モジュールの内容。
 */
export const lawUtil = _lawUtil;

/**
 * `Element` の親をさかのぼって条番号や項番号などの階層を取得します。
 * @param el - 検索対象の `Element`
 * @returns - 条番号などを羅列した配列
 */
export const traceTitles = (el: Element): string[] => law_util.traceTitles(el);

/**
 * 法令XML、Lawtext または {@link LawQuery} で列挙された法令を新しいウィンドウの Lawtext app で表示します。
 * @param text - 表示する法令XMLまたは Lawtext
 */
export const showLaw = (text: string | coreQuery.LawQueryItem): Promise<void> => temp_law.showLaw(text);

/**
 * 指定した法令番号または{@link LawQuery} で列挙された法令を表示するLawtext AppのURLを取得します。
 * @param lawOrLawNum - 法令番号または{@link LawQuery} で列挙された法令
 * @param lawtextAppRoot - Lawtext App のトップ画面のURL。指定しない場合は現在表示しているページの情報を使用します。
 * @returns
 */
export const getLawtextAppUrl = (lawOrLawNum: string | LawInfo, lawtextAppRoot?: string): string => law_util.getLawtextAppUrl(lawOrLawNum, lawtextAppRoot);

/**
 * 保存されたオフライン用データを用いてLawtext queryを実行します。
 * @param criteria - 法令のフィルタに用いる {@link LawCriteriaArgs}。`null` を設定するとフィルタを行わず全ての項目を列挙します。
 * @param options - {@link Query} のオプション項目。
 * @returns - フィルタを適用した{@link LawQuery}。
 */
export const query = (criteria: coreQuery.LawCriteria | null = null, options?: coreQuery.QueryOptions): coreQuery.LawQuery => {
    if (location.hostname === "yamachig.github.io") {
        console.error("lawtext.query() はダウンロード版Lawtextでオフライン用データを使用する場合に利用できます。Web版では lawtext.queryViaAPI() を使用してください。ダウンロード版Lawtextはこちら：");
        console.error("https://yamachig.github.io/lawtext-app/#/download/");
    } else {
        storedLoader.listJsonExists().then(exists => {
            if (!exists) {
                console.error("list.jsonが見つかりません。オフライン用データが保存されているかどうかご確認ください。");
            }
        });
    }
    return queryWithLoader(storedLoader, criteria, options);
};

/**
 * e-Gov 法令APIを用いてLawtext queryを実行します。
 * @param criteria - 法令のフィルタに用いる {@link LawCriteriaArgs}。`null` を設定するとフィルタを行わず全ての項目を列挙します。
 * @param options - {@link Query} のオプション項目。
 * @returns - フィルタを適用した{@link Query}。
 */
export const queryViaAPI = (criteria: coreQuery.LawCriteria | null = null, options?: coreQuery.QueryOptions): coreQuery.LawQuery => {
    console.warn("クエリの実行に e-Gov 法令API を使用します。時間がかかる場合があります。ダウンロード版Lawtextでオフライン用データを使用することをご検討ください。ダウンロード版Lawtextはこちら：");
    console.warn("https://yamachig.github.io/lawtext-app/#/download/");
    return queryWithLoader(elawsLoader, criteria, options);
};

export const queryWithLoader = (
    loader: Loader,
    criteria: coreQuery.LawCriteria | null = null,
    options?: coreQuery.QueryOptions,
): coreQuery.LawQuery => {
    return coreQuery.LawQuery.fromFetchInfo(loader, criteria, options);
};

