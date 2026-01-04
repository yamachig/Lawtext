import { buildLawList } from "./lawList";
import { defaultBasePath } from "./defaultBasePath";

export function build(basePath?: string): Promise<void>;
export { buildLawList, defaultBasePath };
