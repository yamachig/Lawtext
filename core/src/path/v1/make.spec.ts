/* eslint-disable no-irregular-whitespace */
import { assert } from "chai";
import getSentenceEnvs from "../../analyzer/getSentenceEnvs";
import xmlToEL from "../../node/el/xmlToEL";
import locate from "./locate";
import make from "./make";
import parse from "./parse";

const xml1 = `\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Law Era="Reiwa" Lang="ja" LawType="Act" Num="88" Year="04" PromulgateMonth="05" PromulgateDay="25">
  <LawNum>平成五年法律第八十八号</LawNum>
  <LawBody>
    <LawTitle Kana="ぎょうせいてつづきほう" Abbrev="行手法" AbbrevKana="ぎ">行政手続法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Article Num="1">
          <ArticleCaption>（目的等）</ArticleCaption>
          <ArticleTitle>第一条</ArticleTitle>
          <Paragraph Num="1">
            <ParagraphNum/>
            <ParagraphSentence>
              <Sentence Num="1" WritingMode="vertical">この法律は、処分、行政指導及び届出に関する手続並びに命令等を定める手続に関し、共通する事項を定めることによって、行政運営における公正の確保と透明性（行政上の意思決定について、その内容及び過程が国民にとって明らかであることをいう。第四十六条において同じ。）の向上を図り、もって国民の権利利益の保護に資することを目的とする。</Sentence>
            </ParagraphSentence>
          </Paragraph>
          <Paragraph Num="2">
            <ParagraphNum>２</ParagraphNum>
            <ParagraphSentence>
              <Sentence Num="1" WritingMode="vertical">処分、行政指導及び届出に関する手続並びに命令等を定める手続に関しこの法律に規定する事項について、他の法律に特別の定めがある場合は、その定めるところによる。</Sentence>
            </ParagraphSentence>
          </Paragraph>
        </Article>
        <Article Num="2">
          <ArticleCaption>（定義）</ArticleCaption>
          <ArticleTitle>第二条</ArticleTitle>
          <Paragraph Num="1">
            <ParagraphNum/>
            <ParagraphSentence>
              <Sentence Num="1" WritingMode="vertical">この法律において、次の各号に掲げる用語の意義は、当該各号に定めるところによる。</Sentence>
            </ParagraphSentence>
            <Item Num="1">
              <ItemTitle>一</ItemTitle>
              <ItemSentence>
                <Column Num="1">
                  <Sentence Num="1" WritingMode="vertical">法令</Sentence>
                </Column>
                <Column Num="2">
                  <Sentence Num="1" WritingMode="vertical">法律、法律に基づく命令（告示を含む。）、条例及び地方公共団体の執行機関の規則（規程を含む。以下「規則」という。）をいう。</Sentence>
                </Column>
              </ItemSentence>
            </Item>
            <Item Num="2">
              <ItemTitle>二</ItemTitle>
              <ItemSentence>
                <Column Num="1">
                  <Sentence Num="1" WritingMode="vertical">処分</Sentence>
                </Column>
                <Column Num="2">
                  <Sentence Num="1" WritingMode="vertical">行政庁の処分その他公権力の行使に当たる行為をいう。</Sentence>
                </Column>
              </ItemSentence>
            </Item>
          </Paragraph>
        </Article>
      </Chapter>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附　則</SupplProvisionLabel>
      <Paragraph Num="1">
        <ParagraphCaption>（施行期日）</ParagraphCaption>
        <ParagraphNum>１</ParagraphNum>
        <ParagraphSentence>
          <Sentence Num="1" WritingMode="vertical">この法律は、公布の日から起算して一年を超えない範囲内において政令で定める日から施行する。</Sentence>
        </ParagraphSentence>
      </Paragraph>
      <Paragraph Num="2">
        <ParagraphCaption>（経過措置）</ParagraphCaption>
        <ParagraphNum>２</ParagraphNum>
        <ParagraphSentence>
          <Sentence Num="1" WritingMode="vertical">この法律の施行前に第十五条第一項又は第三十条の規定による通知に相当する行為がされた場合においては、当該通知に相当する行為に係る不利益処分の手続に関しては、第三章の規定にかかわらず、なお従前の例による。</Sentence>
        </ParagraphSentence>
      </Paragraph>
      <Paragraph Num="3">
        <ParagraphNum>３</ParagraphNum>
        <ParagraphSentence>
          <Sentence Num="1" WritingMode="vertical">この法律の施行前に、届出その他政令で定める行為（以下「届出等」という。）がされた後一定期間内に限りすることができることとされている不利益処分に係る当該届出等がされた場合においては、当該不利益処分に係る手続に関しては、第三章の規定にかかわらず、なお従前の例による。</Sentence>
        </ParagraphSentence>
      </Paragraph>
      <Paragraph Num="4">
        <ParagraphNum>４</ParagraphNum>
        <ParagraphSentence>
          <Sentence Num="1" WritingMode="vertical">前二項に定めるもののほか、この法律の施行に関して必要な経過措置は、政令で定める。</Sentence>
        </ParagraphSentence>
      </Paragraph>
    </SupplProvision>
  </LawBody>
</Law>
`;

const xml2 = `\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Law Era="Showa" Lang="ja" LawType="Act" Num="131" Year="25" PromulgateMonth="05" PromulgateDay="02">
  <LawNum>昭和二十五年法律第百三十一号</LawNum>
  <LawBody>
    <LawTitle Kana="でんぱほう" Abbrev="" AbbrevKana="">電波法</LawTitle>
    <AppdxTable Num="1">
      <AppdxTableTitle WritingMode="vertical">別表第一</AppdxTableTitle>
      <RelatedArticleNum>（第二十四条の二関係）</RelatedArticleNum>
      <Item Num="1">
        <ItemTitle>一</ItemTitle>
        <ItemSentence>
          <Sentence Num="1" WritingMode="vertical">第一級総合無線通信士、第二級総合無線通信士、第三級総合無線通信士、第一級海上無線通信士、第二級海上無線通信士、第四級海上無線通信士、航空無線通信士、第一級陸上無線技術士、第二級陸上無線技術士、陸上特殊無線技士又は第一級アマチュア無線技士の資格を有すること。</Sentence>
        </ItemSentence>
      </Item>
      <Item Num="2">
        <ItemTitle>二</ItemTitle>
        <ItemSentence>
          <Sentence Num="1" WritingMode="vertical">外国の政府機関が発行する前号に掲げる資格に相当する資格を有する者であることの証明書を有すること。</Sentence>
        </ItemSentence>
      </Item>
      <Item Num="3">
        <ItemTitle>三</ItemTitle>
        <ItemSentence>
          <Sentence Num="1" WritingMode="vertical">学校教育法による大学、高等専門学校、高等学校又は中等教育学校において無線通信に関する科目を修めて卒業した者（当該科目を修めて同法による専門職大学の前期課程を修了した者を含む。）であつて、無線設備の機器の試験、調整又は保守の業務に二年以上従事した経験を有すること。</Sentence>
        </ItemSentence>
      </Item>
      <Item Num="4">
        <ItemTitle>四</ItemTitle>
        <ItemSentence>
          <Sentence Num="1" WritingMode="vertical">学校教育法による大学、高等専門学校、高等学校又は中等教育学校に相当する外国の学校において無線通信に関する科目を修めて卒業した者であつて、無線設備の機器の試験、調整又は保守の業務に二年以上従事した経験を有すること。</Sentence>
        </ItemSentence>
      </Item>
    </AppdxTable>
  </LawBody>
</Law>
`;

const xml3 = `\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Law Era="Meiji" Lang="ja" LawType="Act" Num="089" Year="29" PromulgateMonth="04" PromulgateDay="27" ScheduledEnforcementDate="">
  <LawNum>明治二十九年法律第八十九号</LawNum>
  <LawBody>
    <LawTitle Kana="みんぽう" Abbrev="" AbbrevKana="">民法</LawTitle>
    <EnactStatement>民法第一編第二編第三編別冊ノ通定ム</EnactStatement>
    <EnactStatement>此法律施行ノ期日ハ勅令ヲ以テ之ヲ定ム</EnactStatement>
    <EnactStatement>明治二十三年法律第二十八号民法財産編財産取得編債権担保編証拠編ハ此法律発布ノ日ヨリ廃止ス</EnactStatement>
    <EnactStatement>（別冊）</EnactStatement>
  </LawBody>
</Law>
`;

describe("Test path.v1.locate", () => {

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "a=1/p=1";
        const expected = "a=1/p=1";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "a=2/p=1/i=1";
        const expected = "a=2/i=1";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "a=2/i=1";
        const expected = "a=2/i=1";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "sp/p=2";
        const expected = "sp/p=2";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "sp/p=2";
        const expected = "sp/p=2";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml1);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "Chapter=1";
        const expected = "Chapter=1";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml2);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "AppdxTable=1";
        const expected = "AppdxTable=1";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

    it("Success case", () => {
        const el = xmlToEL(xml3);
        const { rootContainer } = getSentenceEnvs(el);
        const pathStr = "EnactStatement[2]";
        const expected = "EnactStatement[2]";
        const parseResult = parse(pathStr);
        if (!parseResult.ok) throw new Error();
        const locateResult = locate(rootContainer, parseResult.value, []);
        if (!locateResult.ok) throw new Error();
        const container = locateResult.value.container;

        const actual = make(container);
        assert.strictEqual(actual, expected);
    });

});
