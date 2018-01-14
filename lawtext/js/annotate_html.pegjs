{
    function replace_lawnum(text) {
        return text.replace(
            /(明治|大正|昭和|平成)([一二三四五六七八九十]+)年(\S+?)第([一二三四五六七八九十百千]+)号/g,
            (s) => {
                return `<span class="lawtext-analyzed lawtext-analyzed-lawnum" data-lawnum="${s}">${s}</span>`;
            },
        );
    }

    let depth = 0;
}

start = text:TEXT? !. { return text || ""; }

NOT_PARENTHESIS_CHAR "NOT_PARENTHESIS_CHAR" =
    [^()（）\[\]［］{}｛｝「」]

TEXT "TEXT" =
    // &(here:$(.*) &{ console.error(here); return true; })
    texts:(
        $NOT_PARENTHESIS_CHAR+
        /
        PARENTHESES_INLINE
        /
        MISMATCH_END_PARENTHESIS
    )+
    {
        return replace_lawnum(texts.join(""));
    }




MISMATCH_START_PARENTHESIS "MISMATCH_START_PARENTHESIS" =
    mismatch:[(（\[［{｛「]
    {
        return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-start-parenthesis">${mismatch}</span>`;
    }

MISMATCH_END_PARENTHESIS "MISMATCH_END_PARENTHESIS" =
    mismatch:[)）\]］}｝」]
    {
        return `<span class="lawtext-analyzed lawtext-analyzed-mismatch-end-parenthesis">${mismatch}</span>`;
    }



PARENTHESES_INLINE "PARENTHESES_INLINE" =
    &("" &{ depth++; return true; })
    target:PARENTHESES_INLINE_INNER
    &("" &{ depth--; return true; })
    { return target; }
    /
    &("" &{ depth--; return false; }) "DUMMY"

PARENTHESES_INLINE_INNER "PARENTHESES_INLINE_INNER" =
    ROUND_PARENTHESES_INLINE
    /
    SQUARE_BRACKETS_INLINE
    /
    CURLY_BRACKETS_INLINE
    /
    SQUARE_PARENTHESES_INLINE
    /
    MISMATCH_START_PARENTHESIS

ROUND_PARENTHESES_INLINE "ROUND_PARENTHESES_INLINE" =
    start:[(（]
    content: (
        texts:(
            $NOT_PARENTHESIS_CHAR+
            /
            PARENTHESES_INLINE
            /
            ![)）] target:MISMATCH_END_PARENTHESIS { return target; }
        )*
        { return texts.join(""); }
    )
    end:[)）]
    {
        let type = "round";
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" data-lawtext-parentheses-type="${type}" data-lawtext-parentheses-depth="${depth}"><span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" data-lawtext-parentheses-type="${type}">${start}</span><span class="lawtext-analyzed lawtext-analyzed-parentheses-content" data-lawtext-parentheses-type="${type}">${content}</span><span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" data-lawtext-parentheses-type="${type}">${end}</span></span>`;
    }

SQUARE_BRACKETS_INLINE "SQUARE_BRACKETS_INLINE" =
    start:[\[［]
    content: (
        texts:(
            $NOT_PARENTHESIS_CHAR+
            /
            PARENTHESES_INLINE
            /
            ![\]］] target:MISMATCH_END_PARENTHESIS { return target; }
        )*
        { return texts.join(""); }
    )
    end:[\]］]
    {
        let type = "squareb";
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" data-lawtext-parentheses-type="${type}" data-lawtext-parentheses-depth="${depth}"><span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" data-lawtext-parentheses-type="${type}">${start}</span><span class="lawtext-analyzed lawtext-analyzed-parentheses-content" data-lawtext-parentheses-type="${type}">${content}</span><span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" data-lawtext-parentheses-type="${type}">${end}</span></span>`;
    }

CURLY_BRACKETS_INLINE "CURLY_BRACKETS_INLINE" =
    start:[{｛]
    content: (
        texts:(
            $NOT_PARENTHESIS_CHAR+
            /
            PARENTHESES_INLINE
            /
            ![}｝] target:MISMATCH_END_PARENTHESIS { return target; }
        )*
        { return texts.join(""); }
    )
    end:[}｝]
    {
        let type = "curly";
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" data-lawtext-parentheses-type="${type}" data-lawtext-parentheses-depth="${depth}"><span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" data-lawtext-parentheses-type="${type}">${start}</span><span class="lawtext-analyzed lawtext-analyzed-parentheses-content" data-lawtext-parentheses-type="${type}">${content}</span><span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" data-lawtext-parentheses-type="${type}">${end}</span></span>`;
    }

SQUARE_PARENTHESES_INLINE "SQUARE_PARENTHESES_INLINE" =
    start:[「]
    content:$[^」]+
    end:[」]
    {
        let type = "square";
        return `<span class="lawtext-analyzed lawtext-analyzed-parentheses" data-lawtext-parentheses-type="${type}" data-lawtext-parentheses-depth="${depth}"><span class="lawtext-analyzed lawtext-analyzed-start-parenthesis" data-lawtext-parentheses-type="${type}">${start}</span><span class="lawtext-analyzed lawtext-analyzed-parentheses-content" data-lawtext-parentheses-type="${type}">${content}</span><span class="lawtext-analyzed lawtext-analyzed-end-parenthesis" data-lawtext-parentheses-type="${type}">${end}</span></span>`;
    }
