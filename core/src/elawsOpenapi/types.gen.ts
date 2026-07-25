// This file is auto-generated from https://laws.e-gov.go.jp/api/2/swagger-ui/lawapi-v2.yaml

export type ClientOptions = {
    baseUrl: 'https://laws.e-gov.go.jp/api/2' | (string & {});
};

/**
 * amendment_type
 *
 * 改正種別
 * * `1`      - 新規
 * * `3`      - 被改正
 * * `8`      - 廃止
 */
export type AmendmentType = '1' | '3' | '8';

/**
 * attached_file
 *
 * 添付ファイル情報
 *
 */
export type AttachedFile = {
    /**
     * 法令ID
     */
    law_revision_id?: string;
    /**
     * 法令XML中のFig要素のsrc属性
     */
    src?: string;
    /**
     * 正誤等による更新日時
     */
    updated?: string;
};

/**
 * attached_files_info
 *
 * 添付ファイル情報
 */
export type AttachedFilesInfo = {
    /**
     * 添付ファイルデータ（添付ファイルをフォルダ名pictに収集し、フォルダ全体をZip形式で圧縮したファイルをBase64でエンコードした文字列）
     */
    image_data?: string;
    /**
     * 添付ファイル一覧
     */
    attached_files?: Array<AttachedFile>;
};

/**
 * category_cd
 *
 * 事項別分類コード:<br>
 * * `001` - 憲法
 * * `002` - 刑事
 * * `003` - 財務通則
 * * `004` - 水産業
 * * `005` - 観光
 * * `006` - 国会
 * * `007` - 警察
 * * `008` - 国有財産
 * * `009` - 鉱業
 * * `010` - 郵務
 * * `011` - 行政組織
 * * `012` - 消防
 * * `013` - 国税
 * * `014` - 工業
 * * `015` - 電気通信
 * * `016` - 国家公務員
 * * `017` - 国土開発
 * * `018` - 事業
 * * `019` - 商業
 * * `020` - 労働
 * * `021` - 行政手続
 * * `022` - 土地
 * * `023` - 国債
 * * `024` - 金融・保険
 * * `025` - 環境保全
 * * `026` - 統計
 * * `027` - 都市計画
 * * `028` - 教育
 * * `029` - 外国為替・貿易
 * * `030` - 厚生
 * * `031` - 地方自治
 * * `032` - 道路
 * * `033` - 文化
 * * `034` - 陸運
 * * `035` - 社会福祉
 * * `036` - 地方財政
 * * `037` - 河川
 * * `038` - 産業通則
 * * `039` - 海運
 * * `040` - 社会保険
 * * `041` - 司法
 * * `042` - 災害対策
 * * `043` - 農業
 * * `044` - 航空
 * * `045` - 防衛
 * * `046` - 民事
 * * `047` - 建築・住宅
 * * `048` - 林業
 * * `049` - 貨物運送
 * * `050` - 外事
 */
export type CategoryCd = '001' | '002' | '003' | '004' | '005' | '006' | '007' | '008' | '009' | '010' | '011' | '012' | '013' | '014' | '015' | '016' | '017' | '018' | '019' | '020' | '021' | '022' | '023' | '024' | '025' | '026' | '027' | '028' | '029' | '030' | '031' | '032' | '033' | '034' | '035' | '036' | '037' | '038' | '039' | '040' | '041' | '042' | '043' | '044' | '045' | '046' | '047' | '048' | '049' | '050';

/**
 * current_revision_status
 *
 * 履歴の状態:
 * * `CurrentEnforced`  - 現施行法令
 * * `UnEnforced`       - 未施行法令
 * * `PreviousEnforced` - 過去施行法令
 * * `Repeal`           - 廃止法令（廃止・失効・実効性喪失）
 */
export type CurrentRevisionStatus = 'CurrentEnforced' | 'UnEnforced' | 'PreviousEnforced' | 'Repeal';

/**
 * elm
 *
 * 指定した法令XMLの要素に該当する法令本文を取得することができます。<br>
 * * 要素を組み合わせる場合は、`-`（半角ハイフン）で要素を結合してください。<br>
 * > （例：本則第１項 `MainProvision-Paragraph_1`）
 * * 下記の表に要素毎の一覧と指定方法を記載しております。
 * * 表に掲載している要素は一例であり、elmで取得可能な要素の詳細は<a href="https://laws.e-gov.go.jp/docs/" target="_blank">法令データ ドキュメンテーション</a>を参照してください。<br>
 *
 * <font color="red">
 * 補足：<br>
 * &nbsp;&nbsp;指定した要素内に他要素がある場合は、他要素の情報も取得されます。<br>
 * &nbsp;&nbsp;例えば、`MainProvision-Paragraph[1]`を指定した場合は、指定された`Paragraph`要素内に`FigStruct`要素が存在していると`FigStruct`情報も含めて取得されます。
 * </font>
 *
 * <table bgcolor="white" border="1">
 * <tr bgcolor="#DDFFFF">
 * <th width="20%">法令XML要素</th>
 * <th width="20%">要素の意味</th>
 * <th width="20%">指定例</th>
 * </tr>
 * <tr>
 * <td>&nbsp; LawNum </td>
 * <td>&nbsp; 法令番号 </td>
 * <td>&nbsp; LawNum[1]</td>
 * </tr>
 * <tr>
 * <td>&nbsp; LawTitle </td>
 * <td>&nbsp; 題名 </td>
 * <td>&nbsp; LawTitle[1]</td>
 * </tr>
 * <tr>
 * <td>&nbsp; EnactStatement </td>
 * <td>&nbsp; 制定文 </td>
 * <td>&nbsp; EnactStatement[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; TOC </td>
 * <td>&nbsp; 目次 </td>
 * <td>&nbsp; TOC[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Preamble </td>
 * <td>&nbsp; 前文 </td>
 * <td>&nbsp; Preamble[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; MainProvision </td>
 * <td>&nbsp; 本則 </td>
 * <td>&nbsp; MainProvision[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Part </td>
 * <td>&nbsp; 編 </td>
 * <td>&nbsp; Part_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Chapter </td>
 * <td>&nbsp; 章 </td>
 * <td>&nbsp; Chapter_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Section </td>
 * <td>&nbsp; 節 </td>
 * <td>&nbsp; Section_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Subsection </td>
 * <td>&nbsp; 款 </td>
 * <td>&nbsp; Subsection_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Division </td>
 * <td>&nbsp; 目 </td>
 * <td>&nbsp; Division_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Article </td>
 * <td>&nbsp; 条 </td>
 * <td>&nbsp; Article_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Paragraph </td>
 * <td>&nbsp; 項 </td>
 * <td>&nbsp; Paragraph_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Item </td>
 * <td>&nbsp; 号 </td>
 * <td>&nbsp; Item_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Subitem1 </td>
 * <td>&nbsp; 号細分 </td>
 * <td>&nbsp; Subitem1_1 </td>
 * </tr>
 * <tr>
 * <td>&nbsp; SupplProvision </td>
 * <td>&nbsp; 附則 </td>
 * <td>&nbsp; SupplProvision[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; AppdxTable </td>
 * <td>&nbsp; 別表 </td>
 * <td>&nbsp; AppdxTable[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; AppdxStyle </td>
 * <td>&nbsp; 別記様式 </td>
 * <td>&nbsp; AppdxStyle[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; AppdxFormat </td>
 * <td>&nbsp; 別記書式 </td>
 * <td>&nbsp; AppdxFormat[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; Appdx </td>
 * <td>&nbsp; 付録 </td>
 * <td>&nbsp; Appdx[1] </td>
 * </tr>
 * <tr>
 * <td>&nbsp; AppdxFig </td>
 * <td>&nbsp; 別図 </td>
 * <td>&nbsp; AppdxFig[1] </td>
 * </tr>
 * </table>
 *
 */
export type Elm = string;

/**
 * エラー情報
 */
export type ErrorInfo = {
    /**
     * エラーコード<br>
     *
     */
    code?: string;
    /**
     * エラーメッセージ
     */
    message?: string;
};

/**
 * file_type
 *
 * ファイル種別:
 * * `xml`         - XML
 * * `json`        - JSON
 * * `html`        - HTML
 * * `rtf`         - RTF
 * * `docx`        - DOCX
 */
export type FileType = 'xml' | 'json' | 'html' | 'rtf' | 'docx';

/**
 * キーワード検索APIレスポンス
 */
export type KeywordResponse = {
    /**
     * 指定`keyword`でヒットした総件数
     */
    total_count?: number;
    /**
     * レスポンス単位で表示した`sentences`数の総和
     */
    sentence_count?: number;
    /**
     * 次指定する`offset`値。末尾まで取得が完了した場合はnull
     */
    next_offset?: number | null;
    /**
     * 法令ID単位の情報リスト<br>
     * * `revision_info` - 指定時点において効力を持つ版のメタ情報
     *
     */
    items?: Array<{
        law_info?: LawInfo;
        revision_info?: RevisionInfo;
        /**
         * 検索ヒット箇所一覧
         */
        sentences?: Array<{
            /**
             * 検索ヒットの場所
             */
            position?: Elm;
            /**
             * 条文内容です。ハイライト箇所は`<span>`タグで囲まれます。XMLでのレスポンスの場合、タグはエスケープされることにご注意ください。
             */
            text?: string;
        }>;
    }>;
};

/**
 * 法令本文取得APIレスポンス
 */
export type LawDataResponse = {
    attached_files_info?: AttachedFilesInfo;
    law_info?: LawInfo;
    revision_info?: RevisionInfo;
    /**
     * 法令本文<br><br>
     * * `law_full_text_format`と`response_format`の指定方法によって、レスポンス形式が変化します。<br><br>
     * * データ構造の詳細は<a href="https://laws.e-gov.go.jp/docs/" target="_blank">法令データ ドキュメンテーション</a>を参照してください。<br><br>
     * * JSON（詳細版）形式、JSON（簡易版）形式とXML形式の各要素は、丸数字で対応関係を表現しています。<br><br>
     * * JSON（詳細版）形式では、`children`オブジェクトでXML形式の階層構造を表現しています。<br><br>
     *
     */
    law_full_text?: {
        [key: string]: unknown;
    } | string;
};

/**
 * law_info
 *
 * 履歴に依存しない法令（法令IDで特定される法令）のメタ情報
 */
export type LawInfo = {
    /**
     * 法令種別
     */
    law_type?: LawType;
    /**
     * 法令ID
     */
    law_id?: string;
    /**
     * 法令番号
     */
    law_num?: string;
    /**
     * 法令番号の元号
     */
    law_num_era?: LawNumEra;
    /**
     * 法令番号の年
     */
    law_num_year?: number;
    /**
     * 法令番号の法令種別
     */
    law_num_type?: LawNumType;
    /**
     * 法令番号の号数
     */
    law_num_num?: string;
    /**
     * 公布日
     */
    promulgation_date?: string;
};

/**
 * law_num_era
 *
 * 法令番号の元号
 */
export type LawNumEra = 'Meiji' | 'Taisho' | 'Showa' | 'Heisei' | 'Reiwa';

/**
 * law_num_type
 *
 * 法令番号の法令種別:
 * * `Constitution`         - 憲法
 * * `Act`                  - 法律
 * * `CabinetOrder`         - 政令
 * * `ImperialOrder`        - 勅令
 * * `MinisterialOrdinance` - 府省令
 * * `Rule`                 - 規則
 * * `Misc`                 - その他
 */
export type LawNumType = 'Constitution' | 'Act' | 'CabinetOrder' | 'ImperialOrder' | 'MinisterialOrdinance' | 'Rule' | 'Misc';

/**
 * 法令履歴一覧取得APIレスポンス
 */
export type LawRevisionsResponse = {
    law_info: LawInfo;
    /**
     * 版一覧
     */
    revisions: Array<RevisionInfo>;
};

/**
 * law_type
 *
 * 法令種別:
 * * `Constitution`         - 憲法
 * * `Act`                  - 法律
 * * `CabinetOrder`         - 政令
 * * `ImperialOrder`        - 勅令
 * * `MinisterialOrdinance` - 府省令
 * * `Rule`                 - 規則
 * * `Misc`                 - その他
 */
export type LawType = 'Constitution' | 'Act' | 'CabinetOrder' | 'ImperialOrder' | 'MinisterialOrdinance' | 'Rule' | 'Misc';

/**
 * 法令一覧取得API レスポンス
 */
export type LawsResponse = {
    /**
     * 取得件数の上限（`limit`）、何件目から取得するか（`offset`）適用前のリストに含まれる項目数（検索条件にマッチした全件数）
     */
    total_count?: number;
    /**
     * 返却するリスト（取得件数の上限（`limit`）、何件目から取得するか（`offset`）適用後）に含まれる項目数
     */
    count: number;
    /**
     * 次の何件目から取得するか（`offset`）。末尾まで取得が完了した場合はnull
     */
    next_offset?: number | null;
    /**
     * 法令ID単位の法令情報
     */
    laws?: Array<{
        /**
         * 改正履歴に依存しない法令情報
         */
        law_info?: LawInfo;
        /**
         * 取得した改正履歴における法令情報
         */
        revision_info?: RevisionInfo;
        /**
         * 最新の履歴における法令情報<br>法令の時点（`asof`）に依存しない現在以前の最新のリビジョン
         */
        current_revision_info?: RevisionInfo;
    }>;
};

/**
 * mission
 *
 * 新規制定又は被改正法令（`New`）・一部改正法令（`Partial`）
 * * `New`      - 新規制定
 * * `Partial`  - 一部改正
 */
export type Mission = 'New' | 'Partial';

/**
 * repeal_status
 *
 * 廃止等の状態:
 * * `None`                - 廃止・失効等の状態なし
 * * `Repeal`              - 廃止
 * * `Expire`              - 失効
 * * `Suspend`             - 停止
 * * `LossOfEffectiveness` - 実効性喪失
 */
export type RepealStatus = 'None' | 'Repeal' | 'Expire' | 'Suspend' | 'LossOfEffectiveness';

/**
 * response_format
 *
 * レスポンス形式（`json` 又は `xml`）
 */
export type ResponseFormat = 'json' | 'xml';

/**
 * revision_info
 *
 * 法令の履歴に関する情報
 */
export type RevisionInfo = {
    /**
     * 法令履歴ID
     */
    law_revision_id?: string;
    /**
     * 法令種別
     */
    law_type?: LawType;
    /**
     * 法令名
     */
    law_title?: string;
    /**
     * 法令名読み
     */
    law_title_kana?: string;
    /**
     * 法令略称
     */
    abbrev?: string;
    /**
     * 法令分野分類
     */
    category?: string;
    /**
     * 正誤等による更新日時
     */
    updated?: string;
    /**
     * 改正法令公布日
     */
    amendment_promulgate_date?: string;
    /**
     * 改正法令施行期日（この履歴に対応する改正の施行期日）
     */
    amendment_enforcement_date?: string;
    /**
     * 施行期日規定等の参考情報（この履歴に対応する改正の施行期日）
     */
    amendment_enforcement_comment?: string;
    /**
     * 擬似的な施行期日（実際の施行期日とは限らない）（この履歴に対応する改正の施行期日）
     */
    amendment_scheduled_enforcement_date?: string;
    /**
     * 改正法令の法令ID（この履歴に対応する改正法令）
     */
    amendment_law_id?: string;
    /**
     * 改正法令名
     */
    amendment_law_title?: string;
    /**
     * 改正法令名読み
     */
    amendment_law_title_kana?: string;
    /**
     * 改正法令番号
     */
    amendment_law_num?: string;
    /**
     * 改正種別
     */
    amendment_type?: AmendmentType;
    /**
     * 廃止等の状態
     */
    repeal_status?: RepealStatus;
    /**
     * 廃止日
     */
    repeal_date?: string | null;
    /**
     * 廃止後の効力（`true`:廃止後でも効力を有するもの / `false`:廃止後に効力を有しないもの）
     */
    remain_in_force?: boolean | null;
    /**
     * 新規制定又は被改正法令（`New`）・一部改正法令（`Partial`）
     */
    mission?: Mission;
    /**
     * 履歴の状態
     */
    current_revision_status?: CurrentRevisionStatus;
};

export type GetLawsData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * 法令ID（部分一致）<br>
         * > 例： `322CO0000000016`<br>
         *
         */
        law_id?: string;
        /**
         * 法令番号（部分一致）<br>
         * > 例： `昭和二十二年政令第十六号`<br>
         *
         */
        law_num?: string;
        /**
         * 法令番号の元号<br>
         * > 例： `Showa`<br>
         *
         */
        law_num_era?: LawNumEra;
        /**
         * 法令番号の号数<br>
         * > 例： `88`<br>
         *
         */
        law_num_num?: string;
        /**
         * 法令番号の法令種別<br>
         * 種類の定義はSchemasの<a href="#model-law_num_type">`law_num_type`</a>を参照してください。<br>
         * > 例： `Act`<br>
         *
         */
        law_num_type?: LawNumType;
        /**
         * 法令番号の年<br>
         * > 例： `60`<br>
         *
         */
        law_num_year?: number;
        /**
         * 法令名又は法令略称（部分一致）<br>
         * > 例： `国家行政組織法`<br>
         *
         */
        law_title?: string;
        /**
         * 法令名読み（部分一致）<br>
         * > 例： `こっかぎょうせいそしきほう`<br>
         *
         */
        law_title_kana?: string;
        /**
         * 法令種別（複数指定可）<br>
         * > 例： `Act,Rule`<br>
         *
         */
        law_type?: Array<LawType>;
        /**
         * 改正法令の法令ID（部分一致）<br>
         * > 注意：本パラメータを指定した場合、パラメータ：法令の時点（`asof`）を無視します。<br>
         * > 例： `429AC0000000054`<br>
         *
         */
        amendment_law_id?: string;
        /**
         * 法令の時点。指定時点以前で最新の改正履歴を、各法令の `revision_info` に格納します。省略した場合、現時点で検索します。<br>
         * > 例： `2023-07-01`<br>
         *
         */
        asof?: string;
        /**
         * 事項別分類コード（複数指定可）<br>
         * コードの定義はSchemasの<a href="#model-category_cd">`category_cd`</a>を参照してください。<br>
         * > 例： `001,002`<br>
         *
         */
        category_cd?: Array<CategoryCd>;
        /**
         * 新規制定又は被改正法令（`New`）・一部改正法令（`Partial`）を指定（複数指定可）<br>
         * > 例： `New,Partial`<br>
         *
         */
        mission?: Array<Mission>;
        /**
         * `true`の場合、法令の時点（`asof`）に依存しない現在以前の最新の版の情報（`current_revision_info`）をレスポンスに含めない<br>
         * > 例： `true`<br>
         * > 既定値： `false`<br>
         *
         */
        omit_current_revision_info?: boolean;
        /**
         * 公布日（指定値を含む、それ以後）<br>
         * > 例： `2023-07-01`<br>
         *
         */
        promulgation_date_from?: string;
        /**
         * 公布日（指定値を含む、それ以前）<br>
         * > 例： `2023-07-01`<br>
         *
         */
        promulgation_date_to?: string;
        /**
         * 廃止等の状態（複数指定可）<br>
         * 状態の定義はSchemasの<a href="#model-repeal_status">`repeal_status`</a>を参照してください。<br>
         * > 例： `Repeal,Expire`<br>
         *
         * <font color=red>`Expire`、`LossOfEffectiveness`指定時のレスポンスデータについて、<br>
         * 廃止日（`repeal_date`）は実際に法令が廃止された日ではなく、データ廃止処理日を指しますので御留意ください。</font><br>
         *
         */
        repeal_status?: Array<RepealStatus>;
        /**
         * レスポンスの `laws` の取得件数の上限。<br>
         * > 例：`50`<br>
         * > 既定値：`100`<br>
         *
         */
        limit?: number;
        /**
         * レスポンスデータの取得開始位置。例えば`10`を指定した場合、11件目からレスポンスデータが取得される。<br>
         * 1〜10件目は取得されない。<br>
         * > 例： `10`<br>
         * > 既定値： `0`<br>
         *
         */
        offset?: number;
        /**
         * レスポンスの並び順を指定（複数指定可）。<br>
         * <a href="#model-law_info">`law_info`</a> 及び <a href="#model-revision_info">`revision_info`</a> 配下のフィールドを指定可能。<br>
         * 先頭に + を付けると昇順、- を付けると降順、符号がない場合は昇順。<br><br>
         *
         * 例： `+law_info.law_id,-revision_info.amendment_promulgate_date`<br>
         * 既定値： `law_info.law_id`<br>
         *
         */
        order?: string;
        /**
         * レスポンス形式（`json` 又は `xml`）。指定なしの場合はAcceptヘッダから判断、判断できない場合は `json` とする。<br>
         * > 例： `json`<br>
         * > 既定値： 指定なし<br>
         *
         */
        response_format?: ResponseFormat | null;
    };
    url: '/laws';
};

export type GetLawsErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetLawsError = GetLawsErrors[keyof GetLawsErrors];

export type GetLawsResponses = {
    /**
     * 200 リクエスト処理、レスポンス処理が正しく行えた時
     */
    200: LawsResponse;
};

export type GetLawsResponse = GetLawsResponses[keyof GetLawsResponses];

export type GetRevisionsData = {
    body?: never;
    path: {
        /**
         * 法令ID又は法令番号（完全一致）。<br>
         * > 例： `503AC0000000036`、`令和三年法律第三十六号`<br>
         *
         */
        law_id_or_num: string;
    };
    query?: {
        /**
         * 法令名又は法令略称（部分一致又は正規表現）<br>
         * * 本パラメータを`/`で囲まずに指定した場合は、部分一致で検索します。<br>
         * > 例： `デジタル庁設置法`<br>
         * * 本パラメータを`/`で囲んで指定した場合は、正規表現を利用して完全一致で検索します。<br>
         * > 例： `/デジタル庁.*法/`、`/^デジタル庁設置法$/`<br>
         *
         */
        law_title?: string;
        /**
         * 法令名読み（部分一致）<br>
         * > 例： `でじたるちょうせっちほう`<br>
         *
         */
        law_title_kana?: string;
        /**
         * 改正法令施行期日（指定値を含む、それ以後）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        amendment_date_from?: string;
        /**
         * 改正法令施行期日（指定値を含む、それ以前）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        amendment_date_to?: string;
        /**
         * 改正法令の法令ID（部分一致）<br>
         * > 例： `506AC0000000046`<br>
         *
         */
        amendment_law_id?: string;
        /**
         * 改正法令の法令番号（部分一致）<br>
         * > 例： `令和六年法律第四十六号`<br>
         *
         */
        amendment_law_num?: string;
        /**
         * 改正法令の法令名（部分一致又は正規表現）<br>
         * * 本パラメータを`/`で囲まずに指定した場合は、部分一致で検索します。<br>
         * > 例： `デジタル社会形成基本法等の一部を改正する法律`<br>
         * * 本パラメータを`/`で囲んで指定した場合は、正規表現を利用して完全一致で検索します。<br>
         * > 例： `/^情報通信技術.*法律$/`<br>
         *
         */
        amendment_law_title?: string;
        /**
         * 改正法令の法令名読み（部分一致）<br>
         * > 例： `でじたるしゃかいけいせいきほんほうとうのいちぶをかいせいするほうりつ`<br>
         *
         */
        amendment_law_title_kana?: string;
        /**
         * 改正法令公布日（指定値を含む、それ以後）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        amendment_promulgate_date_from?: string;
        /**
         * 改正法令公布日（指定値を含む、それ以前）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        amendment_promulgate_date_to?: string;
        /**
         * 改正種別（複数指定可）<br>
         * 改正種別の定義はSchemasの<a href="#model-amendment_type">`amendment_type`</a>を参照してください。<br>
         * > 例： `1,3`<br>
         *
         */
        amendment_type?: Array<AmendmentType>;
        /**
         * 事項別分類コード（複数指定可）<br>
         * コードの定義はSchemasの<a href="#model-category_cd">`category_cd`</a>を参照してください。<br>
         * > 例： `011,021`<br>
         *
         */
        category_cd?: Array<CategoryCd>;
        /**
         * 履歴の状態（法令の時点（`asof`）の値に関わらず常に現時点の状態と比較する）（複数指定可）<br>
         * 状態の定義はSchemasの<a href="#model-current_revision_status">`current_revision_status`</a>を参照してください。<br>
         * > 例： `CurrentEnforced,PreviousEnforced`<br>
         *
         */
        current_revision_status?: Array<CurrentRevisionStatus>;
        /**
         * 新規制定又は被改正法令（`New`）・一部改正法令（`Partial`）を指定（複数指定可）<br>
         * > 例： `New,Partial`<br>
         *
         */
        mission?: Array<Mission>;
        /**
         * 廃止後の効力（`true`:廃止後でも効力を有するもの / `false`:廃止後に効力を有しないもの）<br>
         * > 例： `false`<br>
         *
         */
        remain_in_force?: boolean;
        /**
         * 廃止日（指定値を含む、それ以後）<br>
         * > 例： `2024-04-01`<br>
         *
         */
        repeal_date_from?: string;
        /**
         * 廃止日（指定値を含む、それ以前）<br>
         * > 例： `2024-04-01`<br>
         *
         */
        repeal_date_to?: string;
        /**
         * 廃止等の状態（複数指定可）<br>
         * 状態の定義はSchemasの<a href="#model-repeal_status">`repeal_status`</a>を参照してください。<br>
         *
         * > 例： `None,Repeal`<br>
         *
         * <font color=red>`Expire`、`LossOfEffectiveness`指定時のレスポンスデータについて、<br>
         * 廃止日（`repeal_date`）は実際に法令が廃止された日ではなく、データ廃止処理日を指しますので御留意ください。</font><br>
         *
         */
        repeal_status?: Array<RepealStatus>;
        /**
         * データの更新日（指定値を含む、それ以後）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        updated_from?: string;
        /**
         * データの更新日（指定値を含む、それ以前）<br>
         * > 例： `2024-06-07`<br>
         *
         */
        updated_to?: string;
        /**
         * レスポンス形式（`json` 又は `xml`）。指定なしの場合はAcceptヘッダから判断、判断できない場合は `json` とする。<br>
         * > 例： `json`<br>
         * > 既定値： 指定なし<br>
         *
         */
        response_format?: ResponseFormat | null;
    };
    url: '/law_revisions/{law_id_or_num}';
};

export type GetRevisionsErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetRevisionsError = GetRevisionsErrors[keyof GetRevisionsErrors];

export type GetRevisionsResponses = {
    /**
     * 200 リクエスト処理、レスポンス処理が正しく行えた時
     */
    200: LawRevisionsResponse;
};

export type GetRevisionsResponse = GetRevisionsResponses[keyof GetRevisionsResponses];

export type GetLawDataData = {
    body?: never;
    path: {
        /**
         * 法令ID、法令番号又は法令履歴ID（完全一致）。<br>
         * > 例： `411AC0000000127`、`平成十一年法律第百二十七号`、`411AC0000000127_19990813_000000000000000`<br>
         *
         */
        law_id_or_num_or_revision_id: string;
    };
    query?: {
        /**
         * 法令本文の形式（`json` 又は `xml`）。指定なしの場合は`response_format`により判断される形式に合わせる。<br>
         * > 例： `json`<br>
         * > 既定値： 指定なし<br>
         *
         */
        law_full_text_format?: ResponseFormat | null;
        /**
         * 法令の時点。指定時点以前で最新の履歴に対応する法令本文を取得します。<br>
         * `law_id_or_num_or_revision_id`に法令履歴IDを指定した場合は無視されます。<br>
         * > 例： `2023-04-01`<br>
         *
         */
        asof?: string;
        /**
         * 法令本文の一部のみを取得する場合、取得する条項等の要素を指定します。指定しない場合は全文を取得します。<br>
         * 指定方法はSchemasの<a href="#model-elm">`elm`</a>を参照してください。<br>
         * > 例： `MainProvision-Paragraph[1]`<br>
         *
         */
        elm?: Elm;
        /**
         * JSONレスポンスの`law_full_text`の形式を指定します。<br>
         * `full`を指定した場合、JSON（詳細版）が返却されます。法令XMLを解説した詳細な構造です。<br>
         * `light`を指定した場合、JSON（簡易版）が返却されます。パースに最適化された簡易的な構造です。<br>
         * レスポンス形式がJSONの場合のみ有効です。<br>
         * > 例： `light`<br>
         * > 既定値： `full`<br>
         *
         */
        json_format?: 'full' | 'light';
        /**
         * `true`の場合、レスポンスの`law_full_text`の中に改正法令の附則を含めない<br>
         * > 例： `true`<br>
         * > 既定値： `false`<br>
         *
         */
        omit_amendment_suppl_provision?: boolean;
        /**
         * `true`の場合、レスポンスの`attached_files_info`の`image_data`を返却します。<br>
         * > 例： `true`<br>
         * > 既定値： `false`<br>
         *
         */
        include_attached_file_content?: boolean;
        /**
         * レスポンス形式（`json` 又は `xml`）。指定なしの場合はAcceptヘッダから判断、判断できない場合は `json` とする。<br>
         * > 例： `json`<br>
         * > 既定値： 指定なし<br>
         *
         */
        response_format?: ResponseFormat | null;
    };
    url: '/law_data/{law_id_or_num_or_revision_id}';
};

export type GetLawDataErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetLawDataError = GetLawDataErrors[keyof GetLawDataErrors];

export type GetLawDataResponses = {
    /**
     * 200 リクエスト処理、レスポンス処理が正しく行えた時
     */
    200: LawDataResponse;
};

export type GetLawDataResponse = GetLawDataResponses[keyof GetLawDataResponses];

export type GetAttachmentData = {
    body?: never;
    path: {
        /**
         * 法令履歴ID（完全一致）<br>
         * > jpgの例：`411AC0000000127_19990813_000000000000000`<br>
         * <br>
         * > pdfの例：`322M40000010094_20240601_506M60000010035`<br>
         *
         */
        law_revision_id: string;
    };
    query?: {
        /**
         * 法令XML中のFig要素のsrc属性<br>
         * >  jpgの例：`./pict/H11HO127-001.jpg`<br>
         * <br>
         * >  pdfの例：`./pict/2FH00000007000.pdf`<br>
         *
         */
        src?: string;
    };
    url: '/attachment/{law_revision_id}';
};

export type GetAttachmentErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetAttachmentError = GetAttachmentErrors[keyof GetAttachmentErrors];

export type GetAttachmentResponses = {
    /**
     * ファイルの内容（バイナリ形式）
     */
    200: Blob | File;
};

export type GetAttachmentResponse = GetAttachmentResponses[keyof GetAttachmentResponses];

export type GetKeywordData = {
    body?: never;
    path?: never;
    query: {
        /**
         * キーワード<br>
         * 入力したキーワードを含む法令本文を検索します。<br>
         * ワイルドカード検索、AND検索、OR検索、NOT検索でキーワードを指定できます。<br>
         * * ワイルドカード検索
         *
         * > 例えば、第○条のように一部のキーワードが不明な時にワイルドカードを使用すると、該当する法令本文を検索することができます。
         *
         * > <table bgcolor="white" border="1">
         * <tr bgcolor="#DDFFFF">
         * <th width=20%>キーワード</th>
         * <th width=20%>該当する例</th>
         * <th width=20%>備考</th>
         * </tr>
         * <tr>
         * <td>第*条</td>
         * <td>第二十一条</td>
         * <td>*は0文字以上の文字</td>
         * </tr>
         * <tr>
         * <td>第?条</td>
         * <td>第五条</td>
         * <td>?は1文字の文字</td>
         * </tr>
         * </table>
         *
         *
         * * AND検索、OR検索、NOT検索
         *
         * > 検索方法の仕様は、<a href="https://laws.e-gov.go.jp/help/#how-to-write-a-search-expression" target="_blank">検索式の書き方</a>をご覧ください。<br>
         * > 複数のキーワードを記号でつなげることにより、AND検索、OR検索、NOT検索を組み合わせて検索することができます。<br>
         * > ワイルドカード検索と組み合わせて検索することはできません。
         * > <br>
         * > <br>
         * > 例： `デジタル庁`<br>
         *
         */
        keyword: string;
        /**
         * 法令番号（部分一致）<br>
         * > 例： `平成二十八年個人情報保護委員会規則第六号`<br>
         *
         */
        law_num?: string;
        /**
         * 法令番号の元号<br>
         * > 例： `Heisei`<br>
         *
         */
        law_num_era?: LawNumEra;
        /**
         * 法令番号の号数<br>
         * > 例： `006`<br>
         *
         */
        law_num_num?: string;
        /**
         * 法令番号の法令種別<br>
         * 種類の定義はSchemasの<a href="#model-law_num_type">`law_num_type`</a>を参照してください。<br>
         * > 例： `Rule`<br>
         *
         */
        law_num_type?: LawNumType;
        /**
         * 法令番号の年<br>
         * > 例： `28`<br>
         *
         */
        law_num_year?: number;
        /**
         * 法令種別（複数指定可）<br>
         * > 例： `Act,Rule`<br>
         *
         */
        law_type?: Array<LawType>;
        /**
         * 法令の時点。指定時点以前で最新の改正履歴を、各法令の `revision_info` に格納します。省略した場合、現時点で検索します。<br>
         * > 例： `2024-05-27`<br>
         *
         */
        asof?: string;
        /**
         * 事項別分類コード（複数指定可）<br>
         * コードの定義はSchemasの<a href="#model-category_cd">`category_cd`</a>を参照してください。<br>
         * > 例： `011,021`<br>
         *
         */
        category_cd?: Array<CategoryCd>;
        /**
         * 公布日（開始）<br>
         * > 例： `2016-12-15`<br>
         *
         */
        promulgation_date_from?: string;
        /**
         * 公布日（終了）<br>
         * > 例： `2016-12-15`<br>
         *
         */
        promulgation_date_to?: string;
        /**
         * レスポンスの`sentences`の`position`数の総和の上限。<br>
         * > 例：`50`<br>
         * >  既定値： `100`<br>
         * >  上限値： `1000`
         *
         */
        limit?: number;
        /**
         * レスポンスデータの取得開始位置。例えば`10`を指定した場合、11件目からレスポンスデータが取得される。<br>
         * 1〜10件目は取得されない。<br>
         * > 例： `10`<br>
         * > 既定値： `0`<br>
         *
         */
        offset?: number;
        /**
         * レスポンスの並び順を指定（複数指定可）。<br>
         * <a href="#model-law_info">`law_info`</a> 及び <a href="#model-revision_info">`revision_info`</a> 配下のフィールドを指定可能。<br>
         * 先頭に + を付けると昇順、- を付けると降順、符号がない場合は昇順。<br><br>
         *
         * 例： `+law_info.law_id,-revision_info.amendment_promulgate_date`<br>
         * 既定値： `law_info.law_id`<br>
         *
         */
        order?: string;
        /**
         * レスポンス形式（`json` 又は `xml`）。指定なしの場合はAcceptヘッダから判断、判断できない場合は `json` とする。<br>
         * > 例： `json`<br>
         * > 既定値： 指定なし<br>
         *
         */
        response_format?: ResponseFormat | null;
        /**
         * `sentences`に表示される件数が制限されます。<br>
         * <br>
         * ※本パラメータを指定した場合、<br>
         * `limit`で指定した件数とレスポンスで取得される件数が合わなくなることがあります。<br>
         * `limit`を上回る値を指定した場合、`limit`の指定値が優先されます。<br>
         * > 例：`5`<br>
         *
         */
        sentences_limit?: number;
        /**
         * レスポンス：`items`->`sentences`->`text` の表示文字数（`highlight_tag`で指定したHTMLタグを含む）<br>
         * > 例：`20`<br>
         * > 既定値： `100`<br>
         *
         */
        sentence_text_size?: number;
        /**
         * `keyword`で指定された文言のヒット箇所を囲むHTMLタグ名。<br>
         * > 例： `em`<br>
         * > 規定値： `span`<br>
         *
         */
        highlight_tag?: string;
    };
    url: '/keyword';
};

export type GetKeywordErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetKeywordError = GetKeywordErrors[keyof GetKeywordErrors];

export type GetKeywordResponses = {
    /**
     * 200 リクエスト処理、レスポンス処理が正しく行えた時
     */
    200: KeywordResponse;
};

export type GetKeywordResponse = GetKeywordResponses[keyof GetKeywordResponses];

export type GetLawFileData = {
    body?: never;
    path: {
        /**
         * 法令ID、法令番号又は法令履歴ID（完全一致）。<br>
         * > 例： `405AC0000000088`、`昭和二十二年政令第十六号`、`322CO0000000016_20240401_505CO0000000293`<br>
         *
         */
        law_id_or_num_or_revision_id: string;
        /**
         * ファイル種別<br>
         * コードの定義はSchemasの<a href="#model-file_type">`file_type`</a>を参照してください。<br>
         * > 例： `xml`<br>
         *
         */
        file_type: FileType;
    };
    query?: {
        /**
         * 法令の時点。指定時点以前で最新の履歴に対応する法令本文ファイルを取得します。<br>
         * `law_id_or_num_or_revision_id`に法令履歴IDを指定した場合は無視されます。<br>
         * > 例： `2023-04-01`<br>
         *
         */
        asof?: string;
    };
    url: '/law_file/{file_type}/{law_id_or_num_or_revision_id}';
};

export type GetLawFileErrors = {
    /**
     * 400 Bad Request API クライアント側の問題によるエラー発生時
     */
    400: ErrorInfo;
    /**
     * 500 Internal Server Error サーバ内処理でエラー発生時
     */
    500: ErrorInfo;
};

export type GetLawFileError = GetLawFileErrors[keyof GetLawFileErrors];

export type GetLawFileResponses = {
    /**
     * 法令本文ファイル（バイナリ形式）
     */
    200: Blob | File;
};

export type GetLawFileResponse = GetLawFileResponses[keyof GetLawFileResponses];
