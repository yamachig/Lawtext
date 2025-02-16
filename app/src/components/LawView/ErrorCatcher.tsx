import React from "react";
import styled from "styled-components";

const ErrorComponentDiv = styled.div`
`;

export class ErrorCatcher extends React.Component<React.PropsWithChildren<{ onError?: (error: Error) => void}>, { hasError: boolean, error: Error | null }> {
    constructor(props: { onError: (error: Error) => void}) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public override componentDidCatch(error: Error): void {
        this.setState(Object.assign({}, this.state, { hasError: true, error }));
        if (this.props.onError) this.props.onError(error);
    }

    public override render(): React.JSX.Element | React.JSX.Element[] | null | undefined {
        if (this.state.hasError) {
            return this.renderError();
        } else {
            return this.renderNormal();
        }
    }

    protected renderNormal(): React.JSX.Element | React.JSX.Element[] | null | undefined {
        return <>{this.props.children}</>;
    }

    protected renderError(): React.JSX.Element | React.JSX.Element[] | null | undefined {
        return (
            <ErrorComponentDiv className="alert alert-danger">
                エラーが発生しました：
                {this.state.error && this.state.error.toString()}
            </ErrorComponentDiv>
        );
    }
}
