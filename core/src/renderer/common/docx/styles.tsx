import React from "react";
import { range } from "../../../util";
import { w } from "./tags";

const fontSizePt = 10.5;

export const styles = (
    <w.styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">

        <w.docDefaults>
            <w.rPrDefault>
                <w.rPr>
                    <w.rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/>
                    <w.kern w:val="2"/>
                    <w.sz w:val="21"/>
                    <w.szCs w:val="22"/>
                    <w.lang w:val="en-US" w:eastAsia="ja-JP" w:bidi="ar-SA"/>
                </w.rPr>
            </w.rPrDefault>
            <w.pPrDefault/>
        </w.docDefaults>

        <w.style w:type="character" w:default="1" w:styleId="DefaultCharacter">
            <w.name w:val="c00 デフォルト文字"/>
            <w.uiPriority w:val="1"/>
        </w.style>

        <w.style w:type="paragraph" w:default="1" w:styleId="DefaultParagraph">
            <w.name w:val="00 デフォルト段落"/>
            <w.qFormat/>
            <w.pPr>
                <w.widowControl w:val="0"/>
                <w.jc w:val="both"/>
                <w.autoSpaceDE w:val="0"/>
                <w.autoSpaceDN w:val="0"/>
            </w.pPr>
            <w.rPr>
                <w.rFonts w:ascii="ＭＳ 明朝" w:eastAsia="ＭＳ 明朝" w:hAnsi="ＭＳ 明朝" w:cs="ＭＳ 明朝"/>
                <w.sz w:val={`${fontSizePt * 2}`}/>
            </w.rPr>
        </w.style>

        <w.style w:type="table" w:default="1" w:styleId="DefaultTable">
            <w.name w:val="t00 デフォルト表"/>
            <w.tblPr>
                <w.tblBorders>
                    <w.top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                    <w.left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                    <w.bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                    <w.right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                    <w.insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                    <w.insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
                </w.tblBorders>
                <w.tblCellMar>
                    <w.top w:w={`${fontSizePt * 5}`} w:type="dxa"/>
                    <w.left w:w={`${fontSizePt * 5}`} w:type="dxa"/>
                    <w.bottom w:w={`${fontSizePt * 5}`} w:type="dxa"/>
                    <w.right w:w={`${fontSizePt * 5}`} w:type="dxa"/>
                </w.tblCellMar>
            </w.tblPr>
        </w.style>

        <w.style w:type="character" w:customStyle="1" w:styleId="Emphasis">
            <w.name w:val="c01 強調文字"/>
            <w.basedOn w:val="DefaultCharacter"/>
            <w.uiPriority w:val="1"/>
            <w.qFormat/>
            <w.rPr>
                <w.rFonts w:ascii="ＭＳ ゴシック" w:eastAsia="ＭＳ ゴシック" w:hAnsi="ＭＳ ゴシック" w:cs="ＭＳ ゴシック"/>
            </w.rPr>
        </w.style>

        <w.style w:type="paragraph" w:customStyle="1" w:styleId="EmptyParagraph">
            <w.name w:val="05 空の段落"/>
            <w.basedOn w:val="DefaultParagraph"/>
            <w.qFormat/>
        </w.style>

        {/* <w.style w:type="paragraph" w:customStyle="1" w:styleId="Paragraph">
            <w.name w:val="01-01 条項"/>
            <w.basedOn w:val="DefaultParagraph"/>
            <w.qFormat/>
            <w.pPr>
                <w.ind w:hangingChars="100"/>
            </w.pPr>
        </w.style>

        <w.style w:type="paragraph" w:customStyle="1" w:styleId="Item">
            <w.name w:val="01-02 号"/>
            <w.basedOn w:val="DefaultParagraph"/>
            <w.qFormat/>
            <w.pPr>
                <w.ind w:leftChars="100" w:hangingChars="100"/>
            </w.pPr>
        </w.style> */}

        {[...range(0, 11)].map(i => (<React.Fragment key={100 + i}>

            {/* <w.style w:type="paragraph" w:customStyle="1" w:styleId={`Subitem${i}`}>
                <w.name w:val={`01-${(i + 2).toString().padStart(2, "0")} 号の細分${i}`}/>
                <w.basedOn w:val="DefaultParagraph"/>
                <w.qFormat/>
                <w.pPr>
                    <w.ind w:leftChars={`${(i + 1) * 100}`} w:hangingChars="100"/>
                </w.pPr>
            </w.style> */}

            <w.style w:type="paragraph" w:customStyle="1" w:styleId={`Indent${i}`}>
                <w.name w:val={`02-${(i).toString().padStart(2, "0")} インデント${i}`}/>
                <w.basedOn w:val="DefaultParagraph"/>
                <w.qFormat/>
                <w.pPr>
                    <w.ind w:leftChars={`${i * 100}`}/>
                </w.pPr>
            </w.style>

            <w.style w:type="paragraph" w:customStyle="1" w:styleId={`IndentHanging${i}`}>
                <w.name w:val={`03-${(i).toString().padStart(2, "0")} ぶら下げインデント${i}`}/>
                <w.basedOn w:val="DefaultParagraph"/>
                <w.qFormat/>
                <w.pPr>
                    <w.ind w:leftChars={`${i * 100}`} w:hangingChars="100"/>
                </w.pPr>
            </w.style>


            <w.style w:type="table" w:customStyle="1" w:styleId={`IndentTable${i}`}>
                <w.name w:val={`t01-${(i).toString().padStart(2, "0")} インデント表${i}`}/>
                <w.basedOn w:val="DefaultTable"/>
                <w.tblPr>
                    <w.tblInd w:w={`${fontSizePt * 20 * i + fontSizePt * 5}`} w:type="dxa"/>
                </w.tblPr>
            </w.style>

        </React.Fragment>))}

        {[...range(0, 11)].map(i => (<React.Fragment key={200 + i}>
            <w.style w:type="paragraph" w:customStyle="1" w:styleId={`IndentFirstLine${i}`}>
                <w.name w:val={`04-${(i).toString().padStart(2, "0")} 字下げインデント${i}`}/>
                <w.basedOn w:val="DefaultParagraph"/>
                <w.qFormat/>
                <w.pPr>
                    <w.ind w:leftChars={`${i * 100}`} w:firstLineChars="100"/>
                </w.pPr>
            </w.style>
        </React.Fragment>))}

    </w.styles>
);
export default styles;
