import { BaseLawInfo } from "@coresrc/data/lawinfo";
import { storedLoader } from "./loaders";


export const saveListJson = async (
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<Blob | null> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    progress(0, "Loading CSV...");

    console.log("\nListing up XMLs...");
    let infos: BaseLawInfo[];
    try {
        infos = await storedLoader.loadBaseLawInfosFromCSV();
    } catch (e) {
        console.error("CSV list cannot be fetched.");
        console.error(e.message, e.stack);
        return null;
    }

    console.log(`Processing ${infos.length} XMLs...`);

    const list = await storedLoader.makeLawListFromBaseLawInfos(infos, onProgress);
    progress(undefined, "Generating json...");
    const json = JSON.stringify(list);
    progress(undefined, "Saving json...");
    const blob = new Blob(
        [json],
        { type: "application/json" },
    );
    return blob;
};
