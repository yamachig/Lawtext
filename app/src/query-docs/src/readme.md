Lawtext query の使用方法 
====================================================

Lawtext query は、ブラウザのコンソールとjavascriptを利用した高度な検索機能です。Lawtext query を使用すると、法令XMLの構造や正規表現を利用した法令検索ができます。

## Lawtext query の使用方法

1. Lawtextの画面でブラウザのコンソールを開きます。

    - [Google Chrome の場合](https://developer.chrome.com/docs/devtools/open/#console)（Windowsなど: Ctrl+Shift+J, Mac: Cmd+Option+J）

    - [Firefox の場合](https://developer.mozilla.org/docs/Tools/Web_Console/UI_Tour)（Windowsなど: Ctrl+Shift+K,Mac: Cmd+Option+K）
    
2. コンソールに Lawtext query を使用する javascriptコードを入力して実行します。（[コードの例](#examples)）

## 検索に用いるデータの取得元

Lawtext query の検索に用いるデータは、e-Gov 法令API とオフライン用データの2種類のどちらかを選択します。

- **e-Gov 法令API**: {@link lawtext | lawtext.queryViaAPI()} を使用した場合は、e-Gov法令APIからデータを取得します。e-Gov 法令APIにアクセスできる環境があれば事前の準備なく利用できます。ただし、データをインターネット経由で毎回取得するため、実行に時間がかかる場合があります。

- **オフライン用データ**: {@link lawtext | lawtext.query()} を使用した場合は、オフライン用データを利用します。ダウンロード版Lawtextでオフライン用データを保存している場合に使用できます。多くの場合、e-Gov 法令APIを使用する方法よりも高速です。

## Lawtext query リファレンス

- 法令の検索条件について: {@link LawCriteriaArgs}
- 検索結果の制御について: {@link Query}
- ブラウザのコンソールから利用できる {@link lawtext} オブジェクトについて: {@link lawtext}

## Lawtext query のコード例<a name="examples"></a>

[[include:examples.md]]

