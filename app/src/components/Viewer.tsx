import React, { useEffect } from "react";
import styled from "styled-components";
import { LawtextAppPageStateStruct } from "./LawtextAppPageState";
import { LawView } from "./LawView";
import * as actions from "./actions";
import { useHistory } from "react-router";


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

const ViewerLoading: React.FC<{loadingLawMessage: string}> = props => {
    return (
        <ViewerLoadingDiv>
            <div className="container-fluid" style={{ textAlign: "right" }}>
                <span className="badge badge-secondary">{props.loadingLawMessage}</span>
            </div>
        </ViewerLoadingDiv>
    );
};


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

const ViewerWelcome: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState, setState } = props;

    const [editingKey, setEditingKey] = React.useState(origState.lawSearchKey ?? "");

    const history = useHistory();

    const lawSearchKeyInputRef = React.useRef<HTMLInputElement>(null);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        history.push(`/${editingKey}`);
    };

    useEffect(() => {
        const input = lawSearchKeyInputRef.current;
        if (input) {
            input.focus();
        }
    }, []);

    const lawSearchKeyOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingKey(e.target.value);
    };

    const downloadSampleLawtextOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        actions.downloadSampleLawtext(setState);
    };

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
                    <form onSubmit={handleSearchSubmit}>
                        <div className="input-group">
                            <input
                                ref={lawSearchKeyInputRef}
                                name="lawSearchKey"
                                onChange={lawSearchKeyOnChange}
                                className="form-control search-law-textbox"
                                placeholder="法令名か法令番号を検索" aria-label="法令名か法令番号を検索"
                                value={editingKey}
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
                            onClick={actions.openFile}
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
                        <li><a href="https://elaws.e-gov.go.jp/" target="_blank" rel="noreferrer">e-Gov</a>から法令XMLをダウンロードできます。</li>
                        <li>メモ帳などのテキストエディタで、<a href="https://github.com/yamachig/lawtext" target="_blank" rel="noreferrer">Lawtext</a>ファイルを作れます。<a href="#" onClick={downloadSampleLawtextOnClick}>サンプルをダウンロード</a></li>
                    </ul>
                </div>
            </div>

            {location.href.startsWith("file:") ? (
                <div className="text-muted" style={{ alignSelf: "center", maxWidth: "500px", marginTop: "4em" }}>
                        このページはファイルから直接表示されているため、法令名・番号検索機能など、一部の機能が動作しない場合があります。
                    <a href="https://yamachig.github.io/lawtext-app/" target="_blank" rel="noreferrer" style={{ whiteSpace: "nowrap" }}>Web版Lawtext</a>
                </div>
            ) : (
                <div className="text-muted" style={{ alignSelf: "center", maxWidth: "500px", marginTop: "1em" }}>
                    <div className="container-fluid">
                        <hr />
                        <p style={{ textAlign: "center" }}>
                            <a href="https://yamachig.github.io/lawtext-app/download.html" target="_blank" rel="noreferrer">ダウンロード版Lawtext</a>
                        </p>
                    </div>
                </div>
            )}
        </ViewerWelcomeDiv>
    );
};


const ViewerDiv = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

export const Viewer: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState } = props;
    return (
        <ViewerDiv>
            {origState.loadingLaw &&
                <ViewerLoading loadingLawMessage={origState.loadingLawMessage} />
            }
            {!origState.loadingLaw && !origState.law &&
                <ViewerWelcome {...props} />
            }
            {origState.law &&
                <LawView {...props} />
            }
        </ViewerDiv>
    );
};
