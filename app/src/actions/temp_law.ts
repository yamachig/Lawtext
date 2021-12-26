import { LawQueryItem } from "lawtext/dist/src/data/query";

export const storeTempLaw = (text: string): string => {
    const id = `temp_law_${Math.floor(Math.random() * 1000000000)}`;
    localStorage.setItem(
        "temp_law:" + id,
        JSON.stringify({
            datetime: new Date().toISOString(),
            text,
        }),
    );
    return id;
};

export const showLaw = async (textOrLaw: string | LawQueryItem): Promise<void> => {
    const text = typeof textOrLaw === "string" ? textOrLaw : await textOrLaw.getXML();
    if (!text) {
        console.error("showLaw: XML cannot be fetched.");
        return;
    }
    const id = storeTempLaw(text);
    window.open(`${location.protocol}//${location.host}${location.pathname}#${id}`);
};

export const getTempLaw = (id: string): string | null => {
    const m = /^temp_law_(\d+)$/.exec(id);
    if (!m) return null;
    const json = localStorage.getItem("temp_law:" + id);
    if (json === null) {
        throw new Error(`一時データが見つかりませんでした (id: ${id})`);
    }
    const { text } = JSON.parse(json);
    return text as string;
};
