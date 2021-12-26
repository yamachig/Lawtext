import React from "react";

export const DownloadPage: React.FC = () => {
    React.useEffect(() => {
        document.title = "ダウンロード | Lawtext";
    }, []);

    return (
        <div className="container" style={{ paddingTop: "1em" }}>
            <div className="p-5 mb-4 bg-light rounded-3">
                <h1 className="display-3">Lawtext<small>をダウンロード</small></h1>
                <p className="lead">LawtextのWebアプリをダウンロードすることで、インターネット接続がない環境でも法令ファイル表示などの機能を利用できます。</p>
                <p className="lead">
                    <a className="btn btn-primary btn-lg" href="media/Lawtext-app.zip" download="Lawtext-app.zip" role="button">
                    Lawtextをダウンロード
                    </a>
                </p>
                <p>
                    <a href="https://yamachig.github.io/lawtext-app/" target="_blank" rel="noreferrer">Web版Lawtext</a>
                </p>
            </div>
            <div>

                <h3>ダウンロード版Lawtextの使用方法</h3>

                <h4 className="mt-5">(方法1) index.html を直接開く</h4>
                <p>上記ボタンからダウンロード版Lawtext（Zipファイル）ダウンロード後、Zipファイルを展開し、中にあるindex.htmlを開いてください。ブラウザが起動して、Lawtextが表示されます。インストールは不要です。</p>
                <table className="table table-sm table-bordered" style={{ width: "auto" }}>
                    <thead>
                        <tr>
                            <th colSpan={2} style={{ textAlign: "center" }}>index.html を直接開く場合に利用できるLawtextの機能</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>e-Gov法令APIを用いた法令検索・表示</th>
                            <td>○ (e-Gov法令APIにアクセスできる環境が必要です)</td>
                        </tr>
                        <tr>
                            <th>法令XML、Lawtextファイルの表示</th>
                            <td>○</td>
                        </tr>
                        <tr>
                            <th>表示した法令のWordファイルなどへの変換</th>
                            <td>○</td>
                        </tr>
                        <tr className="table-secondary">
                            <th>オフライン用データを用いた法令検索・表示</th>
                            <td>× (※)</td>
                        </tr>
                    </tbody>
                </table>
                <p>(※) ファイルを直接開く方法では、多くのブラウザで、制限（<a href="https://developer.mozilla.org/ja/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp" target="_blank" rel="noreferrer">例</a>）によりオフライン用データにアクセスすることができません。ブラウザの設定によりアクセスが可能となる場合があります。</p>

                <h4 className="mt-5">(方法2) ローカルHTTPサーバを用いて開く</h4>
                <p>上記ボタンからオフライン版Lawtext（Zipファイル）ダウンロード後、Zipファイルを展開し、展開後のフォルダでローカルHTTPサーバを実行してください(<a href="https://developer.mozilla.org/docs/Learn/Common_questions/set_up_a_local_testing_server" target="_blank" rel="noreferrer">ローカルHTTPサーバの例</a>)。表示されたLawtextの画面上の案内に従ってオフライン用データを保存すると、e-Gov 法令APIにアクセスできない環境でも法令を検索・表示できるようになります。</p>
                <table className="table table-sm table-bordered" style={{ width: "auto" }}>
                    <thead>
                        <tr>
                            <th colSpan={2} style={{ textAlign: "center" }}>ローカルHTTPサーバを用いて開く場合に利用できるLawtextの機能</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>e-Gov法令APIを用いた法令検索・表示</th>
                            <td>○ (e-Gov法令APIにアクセスできる環境が必要です)</td>
                        </tr>
                        <tr>
                            <th>法令XML、Lawtextファイルの表示</th>
                            <td>○</td>
                        </tr>
                        <tr>
                            <th>表示した法令のWordファイルなどへの変換</th>
                            <td>○</td>
                        </tr>
                        <tr>
                            <th>オフライン用データを用いた法令検索・表示</th>
                            <td>○</td>
                        </tr>
                    </tbody>
                </table>

            </div>

            <p className="sidebar-footer-block" style={{ fontSize: "0.8em", textAlign: "center", padding: "0.3em 0", color: "rgb(192, 192, 192)" }}>
                <a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer" style={{ marginRight: "2em" }}>
                GitHub
                </a>
                &copy; 2017-{new Date().getFullYear()} yamachi
            </p>
        </div>
    );
};
