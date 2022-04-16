
import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "../../renderer/rules/html";
import { HTMLSentenceChildrenRun } from "../../renderer/rules/sentenceChildrenRun";
import { NotImplementedError } from "../../util";
import { SentenceChildEL } from "../../node/cst/inline";


export const HTMLControlRunCSS = /*css*/`

.control-parentheses
{
    transition: background-color 0.3s;
}

.control-parentheses:hover,
.paragraph-item-Paragraph:hover .control-parentheses
{
    background-color: hsla(60, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="1"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="1"]
{
    background-color: hsla(60, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="2"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="2"]
{
    background-color: hsla(30, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="3"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="3"]
{
    background-color: hsla(0, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="4"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="4"]
{
    background-color: hsl(330, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="5"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="5"]
{
    background-color: hsl(300, 100%, 50%, 0.1);
}

.control-parentheses[data-parentheses_depth="6"]:hover,
.paragraph-item-Paragraph:hover .control-parentheses[data-parentheses_depth="6"]
{
    background-color: hsl(270, 100%, 50%, 0.1);
}

.control-start-parenthesis,
.control-end-parenthesis
{
    border: 1px solid transparent;
    margin: -1px;
    transition: border-color 0.3s;
}

.control-parentheses:hover
    > .control-start-parenthesis,
.control-parentheses:hover
    > .control-end-parenthesis
{
    border-color: gray;
}

.control-mismatch-start-parenthesis {
    color: red;
}

.control-mismatch-end-parenthesis {
    color: red;
}
`;

export interface HTMLControlRunProps { el: std.__EL }

// const isControlRunProps = (props: HTMLComponentProps): props is ControlRunProps => props.el.isControl;

export const HTMLControlRun = wrapHTMLComponent("HTMLControlRun", ((props: HTMLComponentProps & HTMLControlRunProps) => {
    const { el, htmlOptions } = props;

    if (el.tag === "__Parentheses") {
        return <__Parentheses el={el} {...{ htmlOptions }} />;

    } else if (el.tag === "__PStart") {
        return <__PStart el={el} {...{ htmlOptions }} />;

    } else if (el.tag === "__PContent") {
        return <__PContent el={el} {...{ htmlOptions }} />;

    } else if (el.tag === "__PEnd") {
        return <__PEnd el={el} {...{ htmlOptions }} />;

    } else if (el.tag === "__MismatchStartParenthesis") {
        return <__MismatchStartParenthesis el={el} {...{ htmlOptions }} />;

    } else if (el.tag === "__MismatchEndParenthesis") {
        return <__MismatchEndParenthesis el={el} {...{ htmlOptions }} />;

    } else {
        return <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />;
    }
}));

interface __ParenthesesProps { el: std.__EL }

const __Parentheses = (props: HTMLComponentProps & __ParenthesesProps) => {
    const { el, htmlOptions } = props;

    const blocks: JSX.Element[] = [];

    for (const child of el.children) {

        if (typeof child === "string" || child instanceof String) {
            throw new NotImplementedError("string");

        } else if (child.tag === "__PStart") {
            blocks.push(<__PStart el={child as std.__EL} key={child.id} {...{ htmlOptions }} />);

        } else if (child.tag === "__PContent") {
            blocks.push(<__PContent el={child as std.__EL} key={child.id} {...{ htmlOptions }} />);

        } else if (child.tag === "__PEnd") {
            blocks.push(<__PEnd el={child as std.__EL} key={child.id} {...{ htmlOptions }} />);

        } else {
            throw new NotImplementedError(child.tag);

        }
    }
    return (
        <span
            className="control-parentheses"
            data-parentheses_type={el.attr.type}
            data-parentheses_depth={el.attr.depth}
        >
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </span>
    );
};


interface __PStartProps { el: std.__EL }

const __PStart = (props: HTMLComponentProps & __PStartProps) => {
    const { el, htmlOptions } = props;
    return (
        <span
            className="control-start-parenthesis"
            data-parentheses_type={el.attr.type}
        >
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </span>
    );
};

interface __PContentProps { el: std.__EL }

const __PContent = (props: HTMLComponentProps & __PContentProps) => {
    const { el, htmlOptions } = props;
    return (
        <span
            className="control-parentheses-content"
            data-parentheses_type={el.attr.type}
        >
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </span>
    );
};


interface __PEndProps { el: std.__EL }

const __PEnd = (props: HTMLComponentProps & __PEndProps) => {
    const { el, htmlOptions } = props;
    return (
        <span
            className="control-end-parenthesis"
            data-parentheses_type={el.attr.type}
        >
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </span>
    );
};


interface __MismatchStartParenthesisProps { el: std.__EL }

const __MismatchStartParenthesis = (props: HTMLComponentProps & __MismatchStartParenthesisProps) => {
    const { el, htmlOptions } = props;
    return (
        <span
            className="control-mismatch-end-parenthesis"
            data-parentheses_type={el.attr.type}
        >
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </span>
    );
};

interface __MismatchEndParenthesisProps { el: std.__EL }

const __MismatchEndParenthesis = (props: HTMLComponentProps & __MismatchEndParenthesisProps) => {
    const { el, htmlOptions } = props;
    return (
        <span
            className="control-mismatch-end-parenthesis"
            data-parentheses_type={el.attr.type}
        >
            <HTMLSentenceChildrenRun els={el.children as (string | SentenceChildEL)[]} {...{ htmlOptions }} />
        </span>
    );
};
