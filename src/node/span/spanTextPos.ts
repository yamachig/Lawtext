export interface SpanTextPos {
    spanIndex: number,
    textIndex: number,
    length: number,
    range: [start: number, end: number] | null,
}

export interface SpanTextRange {
    startSpanIndex: number,
    startTextIndex: number,
    endSpanIndex: number, // half open
    endTextIndex: number, // half open
}
