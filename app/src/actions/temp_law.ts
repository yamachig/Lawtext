export const showLawXML = async (xml: string): Promise<void> => {
    const id = `temp_law_${Math.floor(Math.random() * 1000000000)}`;
    localStorage.setItem(
        "temp_law:" + id,
        JSON.stringify({
            datetime: new Date().toISOString(),
            xml,
        }),
    );
    window.open(`${location.protocol}//${location.host}${location.pathname}#${id}`);
};

export const getTempLaw = (id: string): string | null => {
    const m = /^temp_law_(\d+)$/.exec(id);
    if (!m) return null;
    const json = localStorage.getItem("temp_law:" + id);
    if (json === null) {
        throw new Error(`一時データが見つかりませんでした (id: ${id})`);
    }
    const { xml } = JSON.parse(json);
    return xml as string;
};
