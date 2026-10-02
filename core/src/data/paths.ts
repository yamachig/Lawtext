import { join } from "pathe";

export const getLawdataPath = (dataDir: string): string => join(dataDir, "lawdata");
export const getListJsonPath = (dataDir: string): string => join(dataDir, "list.json");
export const getListCSVPath = (dataDir: string): string => join(dataDir, "lawdata", "all_law_list.csv");
