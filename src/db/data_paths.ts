import path from "path";

export const getLawdataPath = (dataDir: string): string => path.join(dataDir, "lawdata");
export const getListJsonPath = (dataDir: string): string => path.join(dataDir, "list.json");
