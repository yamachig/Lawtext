import { buildTemplates } from "./templates";
import { buildLawNumTable } from "./lawNumTable";
import { defaultBasePath } from "./defaultBasePath";
/**
 * @param {string} basePath
 */
export function build(basePath?: string): Promise<void>;
export { buildTemplates, buildLawNumTable, defaultBasePath };
