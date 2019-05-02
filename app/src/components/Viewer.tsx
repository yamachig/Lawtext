import * as React from "react";
import styled from 'styled-components';
import { Dispatchers } from '../containers/LawtextAppPageContainer';
import { LawtextAppPageState, RouteState } from '../states';
import { LawView } from './LawView';


type Props = LawtextAppPageState & Dispatchers & RouteState;



const ViewerLoadingDiv = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 280px;
    z-index: 100;

    padding-top: 1rem;
    text-align: center;
`;

class ViewerLoading extends React.Component<Props> {
    public render() {
        return (
            <ViewerLoadingDiv>
                <div className="container-fluid" style={{ textAlign: "right" }}>
                    <span className="badge badge-secondary">{this.props.loadingLawMessage}</span>
                </div>
            </ViewerLoadingDiv>
        );
    }
}



const ViewerWelcomeDiv = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 280px;
    z-index: 100;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
`;

class ViewerWelcome extends React.Component<Props, { lawSearchKey: string }> {

    public state = { lawSearchKey: "" };
    protected lawSearchKeyInput: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.state = { lawSearchKey: props.lawSearchKey || "" };
        this.lawSearchKeyInput = React.createRef<HTMLInputElement>();
    }

    protected handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.props.history.push(`/${this.state.lawSearchKey}`);
    }

    public componentDidMount() {
        const input = this.lawSearchKeyInput.current;
        if (input) {
            input.focus();
        }
    }

    public render() {

        const formOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            this.handleSearchSubmit(e);
        }

        const lawSearchKeyOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({ lawSearchKey: e.target.value });
        }

        const downloadSampleLawtextOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            this.props.downloadSampleLawtext(); e.preventDefault();
        }

        return (
            <ViewerWelcomeDiv>
                <div>
                    <div className="container-fluid">
                        <p style={{ fontSize: "3em", textAlign: "center" }}>
                            Lawtextへようこそ！
                        </p>
                    </div>
                </div>

                <div className="row justify-content-center search-law-block" style={{ margin: "1em" }}>
                    <div className="col-md-6" style={{ maxWidth: "500px" }}>
                        <form onSubmit={formOnSubmit}>
                            <div className="input-group">
                                <input
                                    ref={this.lawSearchKeyInput}
                                    name="lawSearchKey"
                                    onChange={lawSearchKeyOnChange}
                                    className="form-control search-law-textbox"
                                    placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                                    value={this.state.lawSearchKey || ""}
                                />
                                <span className="input-group-btn">
                                    <button className="btn btn-secondary search-law-button" type="submit" >
                                        検索
                                    </button>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="container-fluid">
                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={this.props.openFile}
                                className="lawtext-open-file-button btn btn-primary"
                            >
                                法令ファイルを開く
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-muted" style={{ alignSelf: "center", maxWidth: "500px", marginTop: "4em" }}>
                    <div className="container-fluid">
                        <p style={{ textAlign: "center" }}>
                            法令ファイルがありませんか？
                        </p>
                        <ul>
                            <li><a href="http://elaws.e-gov.go.jp/" target="_blank">e-Gov</a>から法令XMLをダウンロードできます。</li>
                            <li>メモ帳などのテキストエディタで、<a href="https://github.com/yamachig/lawtext" target="_blank">Lawtext</a>ファイルを作れます。<a href="#" onClick={downloadSampleLawtextOnClick}>サンプルをダウンロード</a></li>
                        </ul>
                    </div>
                </div>

                {location.href.startsWith("file:") ? (
                    <div className="text-muted" style={{ alignSelf: "center", maxWidth: "500px", marginTop: "4em" }}>
                        このページはファイルから直接表示されているため、法令名・番号検索機能など、一部の機能が動作しない場合があります。
                        <a href="https://yamachig.github.io/lawtext-app/" target="_blank" style={{ whiteSpace: "nowrap" }}>Web版Lawtext</a>
                    </div>
                ) : (
                        <div className="text-muted" style={{ alignSelf: "center", maxWidth: "500px", marginTop: "1em" }}>
                            <div className="container-fluid">
                                <hr />
                                <p style={{ textAlign: "center" }}>
                                    <a href="https://yamachig.github.io/lawtext-app/download.html" target="_blank">ダウンロード版Lawtext</a>
                                </p>
                            </div>
                        </div>
                    )}
            </ViewerWelcomeDiv>
        );
    }
}


const ViewerDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export class Viewer extends React.Component<Props> {
    public render() {
        return (
            <ViewerDiv>
                {this.props.loadingLaw &&
                    <ViewerLoading {...this.props} />
                }
                {!this.props.loadingLaw && !this.props.law &&
                    <ViewerWelcome {...this.props} />
                }
                {this.props.law &&
                    <LawView {...this.props} />
                }
            </ViewerDiv>
        );
    }
}