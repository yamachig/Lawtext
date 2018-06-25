import * as React from "react";
import * as JSZip from "jszip";
import * as FileSaver from "file-saver";
import * as path from "path";
import { DOMParser } from "xmldom";

export function wait(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function range(start: number, end: number) {
    return Array.from({length: (end - start)}, (_, k) => k + start);
}

export class LawDownloader extends React.Component<
    {

    }, {
        downloading: boolean;
        progress: number;
        message: string;
    }
> {
    downloader: Downloader;
    constructor(props:any) {
        super(props);

        this.state = {
            downloading: false,
            progress: 0,
            message: ""
        };

        this.downloader = new Downloader(
            (progress) => this.handleDownloaderProgress(progress),
            (message) => this.handleDownloaderMessage(message)
        );
    }

    handleDownloaderProgress(progress:number) {
        this.setState({progress: progress});
    }

    handleDownloaderMessage(message:string) {
        this.setState({message: message});
    }

    handleDownloadButtonClick() {
        if(this.state.downloading) return;
        this.setState({downloading: true});
        this.downloader.run();
    }

    render() {
        return (
            <div>
                {this.state.downloading ? (
                    <DownloadStateView progress={this.state.progress} message={this.state.message} />
                ) : (
                    <DownloadButton onClick={() => this.handleDownloadButtonClick()} />
                )}
            </div>
        );
    }
}

class DownloadButton extends React.Component<
    {
        onClick: (event:React.MouseEvent<HTMLButtonElement>) => any
    }
> {
    render() {
        return (
            <button
                className="btn btn-primary btn-lg"
                role="button"
                onClick={this.props.onClick}
            >
                e-Gov法令ファイルをダウンロード
            </button>
        );
    }
}

class DownloadStateView extends React.Component<
    {
        progress: number,
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
                    {this.props.progress < 1 ? (
                        `ダウンロード中: ${this.props.message}`
                    ) : (
                        "ダウンロード完了"
                    )}
                </div>
                <div
                    className="progress"
                    style={{backgroundColor: "white"}}
                >
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{width: `${this.props.progress * 100}%`}}
                    ></div>
                </div>
            </div>
        );
    }
}

class Downloader {

    onProgress: (progress:number)=>void;
    onMessage: (message:string)=>void;

    constructor(
        onProgress:(progress:number)=>void,
        onMessage:(message:string)=>void
    ) {
        this.onProgress = onProgress;
        this.onMessage = onMessage;
    }

    async run() {
        this.onProgress(0);
        this.onMessage("開始しました");

        let filenames = [
            ...range(104, 145 + 1),
            ...range(201, 215 + 1),
            ...range(301, 364 + 1),
            ...range(401, 430 + 1),
            // ...range(428, 430 + 1),
        ].map((v) => `${v}.zip`);

        let progress_total = filenames.length + 3;
        let progress_now = 0;

        let dest_zip = new JSZip();
        let lawinfos:LawInfo[] = [];
        let lawinfo_dict:{[lawnum:string]: LawInfo} = {};

        for(let filename of filenames) {
            let response = await fetch(`http://elaws.e-gov.go.jp/download/${filename}`, {
                mode: "cors",
            });
            let zip_data = await response.arrayBuffer();
            let src_zip = await JSZip.loadAsync(zip_data);

            let items:[string,JSZip.JSZipObject][] = [];
            src_zip.forEach((relativePath, file) => {
                items.push([relativePath, file]);
            });

            for(let [relativePath, file] of items) {
                if(file.dir) {
                    dest_zip.folder(relativePath);
                } else {
                    if (/^[^/]+\/[^/]+\/[^/]+.xml$/.test(relativePath)) {
                        let xml = await file.async("text");
                        let lawinfo = new LawInfo(xml, relativePath);
                        lawinfo_dict[lawinfo.LawNum] = lawinfo;
                        lawinfos.push(lawinfo);
                        this.onMessage(`${lawinfo.LawNum}：${lawinfo.LawTitle}`);
                    }

                    let inner_zip = new JSZip();
                    let inner_data = await file.async("arraybuffer");
                    inner_zip.file(file.name, inner_data);
                    let inner_zip_data = await inner_zip.generateAsync({
                        type: "arraybuffer",
                        compression: "DEFLATE",
                        compressionOptions: {
                            level: 9
                        }
                    });
                    dest_zip.file(relativePath + ".zip", inner_zip_data);
                }
            }

            progress_now++;
            this.onProgress(progress_now / progress_total);
        }

        this.onMessage(`相互参照を分析しています`);
        let all_lawnums = new Set(lawinfos.map(lawinfo => lawinfo.LawNum));
        for(let lawinfo of lawinfos) {
            for(let lawnum of Array.from(lawinfo.ReferencingLawNums)) {
                if(all_lawnums.has(lawnum)) {
                    lawinfo_dict[lawnum].ReferencedLawNums.add(lawinfo.LawNum);
                } else {
                    lawinfo.ReferencingLawNums.delete(lawnum);
                }
            }
        }

        progress_now++;
        this.onProgress(progress_now / progress_total);

        this.onMessage(`リストを出力しています`);
        let list = lawinfos.map((lawinfo) => {
            return [
                lawinfo.LawNum,
                Array.from(lawinfo.ReferencingLawNums),
                Array.from(lawinfo.ReferencedLawNums),
                lawinfo.LawTitle,
                lawinfo.Path,
                lawinfo.XmlZipName,
            ];
        });
        let list_json = JSON.stringify(list);
        dest_zip.file("list.json", list_json);

        progress_now++;
        this.onProgress(progress_now / progress_total);

        this.onMessage(`Zipファイルを出力しています`);
        let dest_zip_data = await dest_zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        this.onProgress(1);
        FileSaver.saveAs(dest_zip_data, "lawdata.zip");
    }
}

export const re_lawnum = /(?:(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/g;
const dom_parser = new DOMParser();

class LawInfo {
    LawNum: string;
    ReferencingLawNums: Set<string>;
    ReferencedLawNums: Set<string>;
    LawTitle: string;
    Path: string;
    XmlZipName: string;

    constructor(xml:string, xml_path:string) {
        let law = dom_parser.parseFromString(xml, "text/xml");
        let el_lawnum = law.getElementsByTagName("LawNum")[0];
        let el_lawbody = law.getElementsByTagName("LawBody")[0];
        let el_lawtitle = el_lawbody.getElementsByTagName("LawTitle")[0];

        this.LawNum = (el_lawnum.textContent || "").trim();
        this.ReferencingLawNums = new Set(xml.match(re_lawnum));
        this.ReferencedLawNums = new Set();
        this.LawTitle = (el_lawtitle.textContent || "").trim();
        this.Path = path.dirname(xml_path);
        this.XmlZipName = `${xml_path}.zip`;
    }
}
