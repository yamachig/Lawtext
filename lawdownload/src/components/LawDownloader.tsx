import * as React from "react";
import * as FileSaver from "file-saver";
import { download } from "../../../js/src/downloader";

export class LawDownloader extends React.Component<
    {

    }, {
        downloading: boolean;
        ratio: number;
        message: string;
    }
    > {
    constructor(props: any) {
        super(props);

        this.state = {
            downloading: false,
            ratio: 0,
            message: ""
        };
    }

    async handleDownloadButtonClick(withPics?: boolean) {
        if (this.state.downloading) return;
        this.setState({ downloading: true });

        const progress = (ratio: number, message: string) => {
            this.setState({ ratio: ratio, message: message });
        };

        const data = withPics
            ? (await download({ full: true }, progress)).full
            : (await download({ withoutPics: true }, progress)).withoutPics;

        FileSaver.saveAs(new Blob([data]), "lawdata.zip");
    }

    render() {
        return (
            <div>
                {this.state.downloading ? (
                    <DownloadStateView ratio={this.state.ratio} message={this.state.message} />
                ) : (
                        <div>
                            <button
                                className="btn btn-primary btn-lg"
                                role="button"
                                onClick={() => this.handleDownloadButtonClick(true)}
                            >
                                e-Gov法令ファイルをダウンロード
                            </button>
                            &nbsp;
                            <button
                                className="btn btn-primary btn-lg"
                                role="button"
                                onClick={() => this.handleDownloadButtonClick(false)}
                            >
                                図表なし
                            </button>
                        </div>
                    )}
            </div>
        );
    }
}

class DownloadStateView extends React.Component<
    {
        ratio: number,
        message: string
    }
    > {
    render() {
        return (
            <div>
                <div style={{
                    whiteSpace: "nowrap",
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {this.props.ratio < 1 ? (
                        `ダウンロード中: ${this.props.message}`
                    ) : (
                            "ダウンロード完了"
                        )}
                </div>
                <div
                    className="progress"
                    style={{ backgroundColor: "white" }}
                >
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${this.props.ratio * 100}%` }}
                    ></div>
                </div>
            </div>
        );
    }
}
