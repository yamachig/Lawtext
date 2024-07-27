/* eslint-disable no-irregular-whitespace */
import { test, expect } from "@playwright/test";

test("test downloading Word file", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.addStyleTag({ content: `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
html,body {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
` });
    await page.evaluate(() => document.fonts.ready);

    await page.getByText("Lawtextへようこそ！").waitFor({ state: "visible" });
    await testInfo.attach("top", { body: await page.screenshot(), contentType: "image/png" });

    for (const lawId of [
        "405AC0000000088",
        "411AC0000000127",
        "423M60000008024",
    ]) {
        await page.goto(`/#/v1:${lawId}`);
        await page.locator(".law-title").waitFor({ state: "visible" });
        await page.locator(".spinner-border").waitFor({ state: "hidden" });
        await testInfo.attach(`${lawId}-lawView`, { body: await page.screenshot(), contentType: "image/png" });
        if (testInfo.project.name.includes("Mobile")) {
            await page.getByTitle(/^サイドバーの表示を切り替える/).click();
            await page.getByTitle(/^Wordファイルを保存：出力方式を選択/).waitFor({ state: "visible" });
            await testInfo.attach(`${lawId}-sidebar`, { body: await page.screenshot(), contentType: "image/png" });
        }
        await page.getByTitle(/^Wordファイルを保存：出力方式を選択/).click();
        await testInfo.attach(`${lawId}-dropdown`, { body: await page.screenshot(), contentType: "image/png" });
        const downloadPromise = page.waitForEvent("download");
        await page.getByTitle(/^Wordファイルを保存$/).getByText(/^添付PDFファイルを埋め込み＋画像化してWord出力/).click();
        const download = await downloadPromise;
        await download.saveAs(testInfo.outputPath(download.suggestedFilename()));

        if (testInfo.project.name.includes("Mobile")) {
            await page.mouse.click((page.viewportSize()?.width ?? 300) - 10, 10);
            await page.getByTitle(/^Wordファイルを保存：出力方式を選択/).waitFor({ state: "hidden" });
        }

        await expect(page.locator("body")).not.toContainText("エラーが発生しました：");
    }
});

test("test peekView", async ({ page }, testInfo) => {
    await page.goto("/#/v1:405AC0000000088");
    await page.addStyleTag({ content: `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
html,body {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
` });
    await page.evaluate(() => document.fonts.ready);

    const a_1 = page.getByText(/^第一条　この法律は、処分、行政指導及び届出に関する手続並びに命令等/);
    await a_1.getByText(/^命令等$/).first().click();
    await expect(a_1).toHaveText(/第二条／八　命令等　内閣又は行政機関が定める次に掲げるものをいう。/);

    await testInfo.attach("a_1", { body: await page.screenshot(), contentType: "image/png" });

    await expect(page.locator("body")).not.toContainText("エラーが発生しました：");

    const a_2__i_5__si1_1 = page.getByText(/^イ　法律の規定に基づき内閣に置かれる機関若しくは内閣の所轄の下に置かれる機関、宮内庁、内閣府設置法（平成十一年法律第八十九号）第四十九条第一項若しくは第二項/);
    await a_2__i_5__si1_1.getByText(/^第二項$/).first().click();
    await expect(a_2__i_5__si1_1).toHaveText(/第四十九条／２　法律で国務大臣をもってその長に充てることと定められている前項の委員会には、特に必要がある場合においては、委員会又は庁を置くことができる。/);

    await testInfo.attach("a_2__i_5__si1_1", { body: await page.screenshot(), contentType: "image/png" });

    await expect(page.locator("body")).not.toContainText("エラーが発生しました：");

    await page.goto("/#/v1:359AC0000000086");

    const a_31__p_4 = page.getByText(/^４　総務大臣は、第一種指定電気通信設備を設置する電気通信事業者が第二項各号に掲げる行為を行つていると認めるとき、又は前項の委託を受けた子会社が前条第四項各号に掲げる行為若しくは第二項各号に掲げる行為を行つていると認めるときは、当該電気通信事業者に対し、同項各号に掲げる行為の停止若しくは変更を命じ、又は当該委託を受けた子会社による同条/);
    await a_31__p_4.getByText(/^同条$/).first().click();
    await expect(a_31__p_4).toHaveText(/第三十条　総務大臣は、総務省令で定めるところにより、/);

    await testInfo.attach("a_31__p_4", { body: await page.screenshot(), contentType: "image/png" });

    await expect(page.locator("body")).not.toContainText("エラーが発生しました：");
});

test("test navigation", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.addStyleTag({ content: `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
html,body {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
` });
    await page.evaluate(() => document.fonts.ready);

    await page.getByText("Lawtextへようこそ！").waitFor({ state: "visible" });
    await testInfo.attach("top", { body: await page.screenshot(), contentType: "image/png" });

    for (const [path, lawTitle] of [
        ["/#/v1:405AC0000000088", "行政手続法"],
        ["/#/マイナンバー法", "行政手続における特定の個人を識別するための番号の利用等に関する法律"],
        ["/#/昭和五十九年法律第八十六号", "電気通信事業法"],
    ]) {
        await page.goto(path);
        await page.locator(".law-title").waitFor({ state: "visible" });
        await page.locator(".spinner-border").waitFor({ state: "hidden" });

        await expect(page.locator(".law-title")).toHaveText(lawTitle);
        await testInfo.attach(`${path}-lawView`, { body: await page.screenshot(), contentType: "image/png" });

        await expect(page.locator("body")).not.toContainText("エラーが発生しました：");
    }
});
