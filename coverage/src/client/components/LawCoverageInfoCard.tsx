import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { assertNever } from "lawtext/dist/src/util";
import * as React from "react";
import styled from "styled-components";


export enum LawCoverageInfoCardStatus {
    NULL,
    SUCCESS,
    WARNING,
    ERROR,
}

const BaseTag = styled.div`
        border: 1px solid rgba(0,0,0,.125);
        border-radius: .25rem;
        font-size: 0.8em;
        margin: .3rem 0;
        text-align: center;
        > .header {
            flex: 0 0;
            padding: .1em;
            background-color: rgba(0,0,0,.03);
        }
        > .body {
            flex: 1 1;
        }
        > .body:not(:first-child) {
            border-top: 1px solid rgba(0,0,0,.125);
        }
    `;

const StatusLeft = styled.div`
        border-right: 1px solid rgba(0,0,0,.125);
        padding: .1em;
        text-align: center;
        flex: 0 0 4em;
    `;

const NullTag = styled(BaseTag)`
        border-color: rgba(0,0,0,.05);
        color: #e6e6e6;
        > .header {
            background-color: transparent;
        }
        > .body {
            border-bottom-color: rgba(0,0,0,.05);
        }
        ${StatusLeft} {
            border-right-color: 1px solid rgba(0,0,0,.125);
        }
    `;

const SuccessTag = styled(BaseTag)`
    `;

const WarningTag = styled(BaseTag)`
        color: #856404;
        background-color: #ffeeba;
    `;

const ErrorTag = styled(BaseTag)`
        color: #721c24;
        background-color: #f5c6cb;
    `;

export const LawCoverageInfoCard: React.FC<{
    status: LawCoverageInfoCardStatus;
    date: Date;
    requiredms?: Map<string, number> | Record<string, number>;
    header?: JSX.Element;
    body?: JSX.Element;
}> = props => {
    const BadgeTag =
            props.status === LawCoverageInfoCardStatus.NULL ? NullTag :
                props.status === LawCoverageInfoCardStatus.SUCCESS ? SuccessTag :
                    props.status === LawCoverageInfoCardStatus.WARNING ? WarningTag :
                        props.status === LawCoverageInfoCardStatus.ERROR ? ErrorTag :
                            assertNever(props.status);
    const requiredms = (
        (props.requiredms instanceof Map)
            ? Array.from(props.requiredms.entries())
            : Object.entries(props.requiredms ?? {})
    );

    return (
        <>
            <BadgeTag className="d-flex flex-column" style={{ flex: "0 0 4rem" }}>
                {props.header && (
                    <div className="header">
                        {props.header}
                    </div>
                )}
                {(props.status !== LawCoverageInfoCardStatus.NULL) && (
                    <div className="body d-flex flex-column">
                        {props.status === LawCoverageInfoCardStatus.SUCCESS && (
                            <span style={{ color: "#28a745" }}>
                                <FontAwesomeIcon icon="check-circle" />
                                            &nbsp;OK
                            </span>
                        )}
                        {props.status === LawCoverageInfoCardStatus.WARNING && (
                            <span>
                                <FontAwesomeIcon icon="exclamation-triangle" />
                                            &nbsp;Wn
                            </span>
                        )}
                        {props.status === LawCoverageInfoCardStatus.ERROR && (
                            <span>
                                <FontAwesomeIcon icon="times" />
                                            &nbsp;Err
                            </span>
                        )}
                    </div>
                )}
            </BadgeTag>
            {(requiredms.map(([key, ms], i) => (
                <small key={i} style={{ marginLeft: "0.5em" }} className="text-muted">
                    {key}:
                    <strong>{ms}</strong>ms;
                </small>
            ))) ?? null}
            {props.body ?? null}
        </>
    );
};

export default LawCoverageInfoCard;
