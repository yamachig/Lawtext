import type { LawQueryItem } from "lawtext/dist/src/data/query.js";

export const popOldestTempLaw = (): string | null => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("temp_law:"));
    if (keys.length === 0) return null;

    let oldest: { key: string; datetime: Date; text: string } | null = null;
    for (const key of keys) {
        const json = localStorage.getItem(key);
        if (!json) continue;
        try {
            const { datetime: datetimeString, text } = JSON.parse(json);
            if (typeof datetimeString !== "string" || typeof text !== "string") continue;
            const datetime = new Date(datetimeString);
            if (!oldest || datetime < oldest.datetime) {
                oldest = { key, datetime, text };
            }
        } catch {
            continue;
        }
    }

    if (oldest) {
        localStorage.removeItem(oldest.key);
    }
    return oldest?.text ?? null;
};

export const storeTempLaw = (text: string): string => {
    const id = `temp_law_${Math.floor(Math.random() * 1000000000)}`;
    try {
        localStorage.setItem(
            "temp_law:" + id,
            JSON.stringify({
                datetime: new Date().toISOString(),
                text,
            }),
        );
        return id;
    } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
            const oldestText = popOldestTempLaw();
            if (oldestText) {
                return storeTempLaw(text);
            } else {
                throw new Error("ブラウザのローカルストレージの容量を超えてしまうため、一時データを保存できませんでした。", { cause: e });
            }
        } else {
            throw e;
        }
    }
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
