// This file is auto-generated from https://laws.e-gov.go.jp/api/2/swagger-ui/lawapi-v2.yaml

import { client } from './client.gen.js';
import type { Client, ClientMeta, Options as Options2, RequestResult, TDataShape } from './client/index.js';
import type { GetAttachmentData, GetAttachmentErrors, GetAttachmentResponses, GetKeywordData, GetKeywordErrors, GetKeywordResponses, GetLawDataData, GetLawDataErrors, GetLawDataResponses, GetLawFileData, GetLawFileErrors, GetLawFileResponses, GetLawsData, GetLawsErrors, GetLawsResponses, GetRevisionsData, GetRevisionsErrors, GetRevisionsResponses } from './types.gen.js';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean, TResponse = unknown> = Options2<TData, ThrowOnError, TResponse> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: keyof ClientMeta extends never ? Record<string, unknown> : ClientMeta;
};

/**
 * 法令一覧取得API
 *
 * ## 概要
 * > &nbsp;&nbsp;指定条件に該当する法令データが返却されます。<br>
 * > &nbsp;&nbsp;例えば、法令名（`law_title`）を指定した場合、指定した法令名を含む法令データが返却されます。<br>
 * > &nbsp;&nbsp;法令種別（`law_type`）を指定した場合、指定した法令種別の法令データが返却されます。<br>
 * > &nbsp;&nbsp;指定必須のパラメータはありません。また、全パラメータを組み合わせる必要もありません。<br>
 * > &nbsp;&nbsp;必要なパラメータを組み合わせて法令データを取得することができます。<br>
 *
 *
 * ## 補足事項
 * > &nbsp;&nbsp;本エンドポイントは、指定条件に該当するデータを`laws`に格納します。<br>
 * > &nbsp;&nbsp;`laws`配下に格納されるデータの解説は以下のとおりです。<br>
 *
 * > * `law_info`
 * >> &nbsp;&nbsp;&nbsp;法令番号（`law_num`）や公布日（`promulgation_date`）等、改正履歴に依存しないデータが格納されます。
 * <br>
 *
 * > * `revision_info`
 * >> &nbsp;&nbsp;&nbsp;改正後の法令名（`law_title`）や改正法令公布日（`amendment_promulgate_date`）等、改正履歴に依存するデータが格納されます。<br>
 * >> &nbsp;&nbsp;&nbsp;法令の時点（`asof`）を指定した場合はその時点で最新の改正履歴を格納します。<br>
 *
 * > * `current_revision_info`
 * >>  &nbsp;&nbsp;&nbsp;法令の時点（`asof`）等の指定にかかわらず、現時点で最新の改正履歴を格納します。<br>
 *
 */
export const getLaws = <ThrowOnError extends boolean = false>(options?: Options<GetLawsData, ThrowOnError>): RequestResult<GetLawsResponses, GetLawsErrors, ThrowOnError> => (options?.client ?? client).get<GetLawsResponses, GetLawsErrors, ThrowOnError>({
    querySerializer: { parameters: {
            law_type: { array: { explode: false } },
            category_cd: { array: { explode: false } },
            mission: { array: { explode: false } },
            repeal_status: { array: { explode: false } }
        } },
    url: '/laws',
    ...options
});

/**
 * 法令履歴一覧取得API
 *
 * ## 概要
 * > &nbsp;&nbsp;法令ID（`law_id`）又は法令番号（`law_num`）を指定必須として、指定した法令の改正履歴が返却されます。<br>
 * > &nbsp;&nbsp;改正履歴は`revisions`配下に格納されており、上から法令履歴ID（`law_revision_id`）が新しい順で改正履歴が返却されます。<br>
 * > &nbsp;&nbsp;指定任意のパラメータと組み合わせることで、返却データを絞り込むことができます。<br>
 *
 * ## 補足事項
 * > &nbsp;&nbsp;本エンドポイントで返却されるデータの解説は以下のとおりです。<br>
 *
 * > * `law_info`
 * >> &nbsp;&nbsp;&nbsp;法令番号（`law_num`）や公布日（`promulgation_date`）等、改正履歴に依存しない法令データが格納されます。
 *
 * > * `revisions`
 * >> &nbsp;&nbsp;&nbsp;改正後の法令名（`law_title`）や改正法令公布日（`amendment_promulgate_date`）等、改正履歴に依存する法令データが格納されます。<br>
 *
 */
export const getRevisions = <ThrowOnError extends boolean = false>(options: Options<GetRevisionsData, ThrowOnError>): RequestResult<GetRevisionsResponses, GetRevisionsErrors, ThrowOnError> => (options.client ?? client).get<GetRevisionsResponses, GetRevisionsErrors, ThrowOnError>({
    querySerializer: { parameters: {
            amendment_type: { array: { explode: false } },
            category_cd: { array: { explode: false } },
            current_revision_status: { array: { explode: false } },
            mission: { array: { explode: false } },
            repeal_status: { array: { explode: false } }
        } },
    url: '/law_revisions/{law_id_or_num}',
    ...options
});

/**
 * 法令本文取得API
 *
 * ## 概要
 * > &nbsp;&nbsp;法令ID（`law_id`）、法令番号（`law_num`）、法令履歴ID（`law_revision_id`）のいずれかを指定必須として、指定した法令の本文を取得します。<br>
 * > * &nbsp;&nbsp;法令ID（`law_id`）、法令番号（`law_num`）を指定した場合は、現時点で最新のリビジョンの本文を取得します。<br>
 * > * &nbsp;&nbsp;法令履歴ID（`law_revision_id`）を指定した場合は、該当するリビジョンの本文を取得します。<br>
 * > * &nbsp;&nbsp;上記の指定必須のパラメータがわからない場合は、法令一覧取得APIで法令名（`law_title`）等を指定してパラメータを調べてください。
 *
 * >&nbsp;&nbsp;<font color="red"><b>注意：</b><br>
 * >&nbsp;&nbsp;法令本文のデータサイズが大きい場合、エラーが発生することがあります。<br>
 * >&nbsp;&nbsp;エラーが発生した場合は、SwaggerUI以外（Microsoft EdgeやGoogle Chromeといったブラウザで法令APIのURLを直接指定等）で実行してください。</font>
 *
 *
 * ## 補足事項
 * > &nbsp;&nbsp;本エンドポイントで返却されるデータの解説は以下のとおりです。<br>
 *
 * > * `attached_files_info`
 * >>&nbsp;&nbsp;添付ファイルに関するデータが格納されます。
 *
 *
 * > * `law_info`
 * >>&nbsp;&nbsp;法令番号（`law_num`）や公布日（`promulgation_date`）等、改正履歴に依存しないデータが格納されます。
 *
 *
 * > * `revision_info`
 * >>&nbsp;&nbsp;改正後の法令名（`law_title`）や改正法令公布日（`amendment_promulgate_date`）等、改正履歴に依存するデータが格納されます。<br>
 * >>&nbsp;&nbsp;法令の時点（`asof`）を指定した場合はその時点で最新の改正履歴を格納します。
 *
 * > * `law_full_text`
 * >>&nbsp;&nbsp;法令の本文情報が格納されます。<br>
 * >>&nbsp;&nbsp;要素（`elm`）パラメータを指定することで要素を絞り込んで本文を取得することができます。指定方法はSchemasの<a href="#model-elm">`elm`</a>を参照してください。
 *
 *
 * ## 法令本文のレスポンス形式
 * > &nbsp;&nbsp;レスポンス形式（`response_format`）を指定することでデータのレスポンス形式をJSON、又はXMLに切り替えることができます。<br>
 * > &nbsp;&nbsp;また、法令本文の形式（`law_full_text_format`）を指定することで法令本文（`law_full_text`）のレスポンス形式を切り替えることができます。
 *
 * > * レスポンス形式（`response_format`）を`json` 、かつ法令本文（`law_full_text`） を`xml`で指定した場合、法令本文（`law_full_text`）はXML形式で返却されます。<br>
 *
 * > * レスポンス形式（`response_format`）を`xml`、かつ法令本文（`law_full_text`）を`json`で指定した場合、法令本文（`law_full_text`）はJSON形式で返却されます。<br>
 *
 * >> <font color="red">上記のように`response_format`と`law_full_text`が異なる場合、`law_full_text`の返却値はBase64でエンコードしておりますので、ご利用の際はBase64でデコードしてください。</font>
 *
 *
 * ## XMLとJSONの関係性
 *
 * >> 例）以下のXMLをJSONで表した場合の対応表を以下に記します。<br>
 * >> ### XML
 * >>> <pre><code>&lt;Sentence Num="1" WritingMode="vertical"&gt;
 * &nbsp;&nbsp;この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・
 * &lt;/Sentence&gt;
 * </pre></code>
 *
 * >> ### JSON（詳細版）
 * >>> <pre><code>{
 * &nbsp;&nbsp;"tag": "Sentence",
 * &nbsp;&nbsp;"attr": {
 * &nbsp;&nbsp;&nbsp;&nbsp;"Num": "1",
 * &nbsp;&nbsp;&nbsp;&nbsp;"WritingMode": "vertical"
 * &nbsp;&nbsp;},
 * &nbsp;&nbsp;"children": [
 * &nbsp;&nbsp;&nbsp;&nbsp;"この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・"
 * &nbsp;&nbsp;]
 * }
 * </pre></code>
 *
 * >> ### JSON（簡易版）
 * >>> <pre><code>{
 * &nbsp;&nbsp;"Sentence": [
 * &nbsp;&nbsp;&nbsp;&nbsp; "この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・"
 * &nbsp;&nbsp;&nbsp;&nbsp;]
 * }
 * </code></pre>
 *
 * >>> - インライン要素（Ruby等）はテキストにタグごと埋め込まれます。
 * >>> - 属性は`AmendLawNum`、`Extract`、`Paragraph`要素の`Num`のみ、フィールドとして含まれます。
 *
 *
 * >> ### XMLとJSON（詳細版）の対応表
 * >>> <table bgcolor="white" border="1">
 * <tr bgcolor="#DDFFFF">
 * <th width="10%">項目名</th>
 * <th width="30%">XML</th>
 * <th width="30%">JSON（詳細版）</th>
 * <th width="30%">JSON（簡易版）</th>
 * </tr>
 * <tr>
 * <td>タグ</td>
 * <td>Sentence</td>
 * <td>"tag": "Sentence"</td>
 * <td>Sentence</td>
 * </tr>
 * <tr>
 * <td>属性</td>
 * <td>Num="1" WritingMode="vertical"</td>
 * <td>"attr": {"Num": "1","WritingMode": "vertical"}</td>
 * <td>なし（一部の属性は、該当タグと同階層に別要素として格納する場合あり）</td>
 * </tr>
 * <tr>
 * <td>子要素</td>
 * <td>この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・</td>
 * <td>"children": ["この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・"]</td>
 * <td>この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、・・・</td>
 * </tr>
 * </table>
 *
 */
export const getLawData = <ThrowOnError extends boolean = false>(options: Options<GetLawDataData, ThrowOnError>): RequestResult<GetLawDataResponses, GetLawDataErrors, ThrowOnError> => (options.client ?? client).get<GetLawDataResponses, GetLawDataErrors, ThrowOnError>({ url: '/law_data/{law_id_or_num_or_revision_id}', ...options });

/**
 * 添付ファイル取得API
 *
 * ## 概要
 * > &nbsp;&nbsp;法令履歴ID（`law_revision_id`）を指定必須パラメータとして、法令本文の添付ファイルを取得します。<br>
 * > &nbsp;&nbsp;法令データ上に存在する添付ファイルの拡張子には、`jpg`、`pdf`があります。<br>
 *
 * > &nbsp;&nbsp;法令本文取得APIのレスポンスデータに含まれる`attached_files_info`のsrc属性（`src`）を指定することで特定の添付ファイルが取得できます。<br>
 * > &nbsp;&nbsp;src属性（`src`）を指定しない場合は、法令本文に含まれる添付ファイルをZip形式で一括取得できます。
 *
 *
 * ## 補足事項
 * > &nbsp;&nbsp;src属性（`src`）の指定有無によってレスポンスの動作が異なります。<br>
 *
 * > &nbsp;&nbsp;src属性（`src`）指定時、
 * > * &nbsp;&nbsp;SwaggerUIでAPIを実行した場合、`jpg`が返却される場合は画像が表示されます。`pdf`の場合はダウンロードリンクが表示されます。
 * > * &nbsp;&nbsp;URLを直接入力した場合、`jpg`が返却される場合は画像が表示されます。`pdf`の場合はファイルがダウンロードされます。
 *
 * > &nbsp;&nbsp;src属性（`src`）未指定時、
 * > * &nbsp;&nbsp;SwaggerUIでAPIを実行した場合、`jpg`、`pdf`のいずれもダウンロードリンクが表示されます。
 * > * &nbsp;&nbsp;URLを直接入力した場合、`jpg`、`pdf`のいずれもZip形式でファイルがダウンロードされます。
 *
 */
export const getAttachment = <ThrowOnError extends boolean = false>(options: Options<GetAttachmentData, ThrowOnError>): RequestResult<GetAttachmentResponses, GetAttachmentErrors, ThrowOnError> => (options.client ?? client).get<GetAttachmentResponses, GetAttachmentErrors, ThrowOnError>({ url: '/attachment/{law_revision_id}', ...options });

/**
 * キーワード検索API
 *
 * ## 概要
 * > キーワード（`keyword`）を指定必須とし、法令本文内に指定したキーワード（`keyword`）を含む法令を取得します。<br>
 * > 本エンドポイントでは、法令本文（`law_full_text`）を対象に全文検索を行います。<br>
 * > 指定任意のパラメータと組み合わせることで、返却データを絞り込むことができます。
 *
 * ## 補足事項
 * > &nbsp;&nbsp;本エンドポイントで返却されるデータの解説は以下のとおりです。
 *
 * > * `law_info`
 * >> &nbsp;&nbsp;&nbsp;法令番号（`law_num`）や公布日（`promulgation_date`）等、改正履歴に依存しないデータが格納されます。
 * <br>
 *
 * > * `revision_info`
 * >> &nbsp;&nbsp;&nbsp;改正後の法令名（`law_title`）や改正法令公布日（`amendment_promulgate_date`）等、改正履歴に依存するデータが格納されます。<br>
 * >> &nbsp;&nbsp;&nbsp;法令の時点（`asof`）を指定した場合はその時点で最新の改正履歴を格納します。<br>
 *
 * > * ### `sentences`
 * >> &nbsp;&nbsp;キーワード（`keyword`）に該当する法令本文の見出し等の構造（`position`）と条文内容（`text`）が格納されます。
 *
 */
export const getKeyword = <ThrowOnError extends boolean = false>(options: Options<GetKeywordData, ThrowOnError>): RequestResult<GetKeywordResponses, GetKeywordErrors, ThrowOnError> => (options.client ?? client).get<GetKeywordResponses, GetKeywordErrors, ThrowOnError>({
    querySerializer: { parameters: { law_type: { array: { explode: false } }, category_cd: { array: { explode: false } } } },
    url: '/keyword',
    ...options
});

/**
 * 法令本文ファイル取得API
 *
 * ## 概要
 * > &nbsp;&nbsp;法令ID（`law_id`）、法令番号（`law_num`）、法令履歴ID（`law_revision_id`）のいずれかと、ファイル種別（`file_type`）を指定必須として、<br>
 * > &nbsp;&nbsp;法令本文をダウンロードすることができます。
 *
 */
export const getLawFile = <ThrowOnError extends boolean = false>(options: Options<GetLawFileData, ThrowOnError>): RequestResult<GetLawFileResponses, GetLawFileErrors, ThrowOnError> => (options.client ?? client).get<GetLawFileResponses, GetLawFileErrors, ThrowOnError>({ url: '/law_file/{file_type}/{law_id_or_num_or_revision_id}', ...options });
