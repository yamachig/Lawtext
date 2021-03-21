import FileSaver from "file-saver";
import React from "react";
import { composeZipByApi } from "../../../core/src/db/compose_zip_by_api";

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

    public async handleDownloadButtonClick(withPict?: boolean) {
        if (this.state.downloading) return;
        this.setState({ downloading: true });

        const progress = (ratio: number, message: string) => {
            this.setState({ ratio, message });
        };

        const data = withPict
            ? (await composeZipByApi({ full: true }, progress)).full
            : (await composeZipByApi({ withoutPict: true }, progress)).withoutPict;

        FileSaver.saveAs(new Blob([data]), "lawdata.zip");
    }

    public render() {
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
    public render() {
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
