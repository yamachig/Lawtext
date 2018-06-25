import * as React from "react";
import { LawDownloader } from "./LawDownloader";

export class LawDownloadPage extends React.Component {
    render() {
        return (
            <div className="container" style={{paddingTop: "1em"}}>

                <div className="jumbotron">
                    <h1 className="display-5">e-Gov法令ファイルをダウンロード</h1>
                    <p className="lead">
                        e-Gov法令ファイルを用いると、オフライン版Lawtextで、e-Govの法令を表示することができます。
                    </p>
                    <hr className="my-4"/>
                    <p>
                        次のボタンからe-Gov法令ファイルがダウンロードできます。Zipファイルをlawdataフォルダとして解凍し、オフライン版Lawtextフォルダの中に移動してください。その後オフライン版Lawtextを起動すると、オフライン環境でもe-Govの法令を表示できます。
                    </p>
                    <LawDownloader />
                </div>

                <div>
                    <div style={{
                        fontSize: "0.8em",
                        textAlign: "center",
                        padding: "0.3em 0",
                        color: "rgb(192, 192, 192)",
                    }}>
                        <a
                            href="https://github.com/yamachig/lawtext"
                            target="_blank"
                            style={{marginRight: "2em"}}
                        >
                            GitHub
                        </a>
                        &copy; 2017-{ new Date().getFullYear() } yamachi
                    </div>
                </div>

            </div>
        );
    }
}