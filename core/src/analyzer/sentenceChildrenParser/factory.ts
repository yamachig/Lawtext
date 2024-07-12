import { RuleFactory } from "generic-parser/lib/rules/factory";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { Env } from "./env";

export const factory = new RuleFactory<SentenceChildEL[], Env>();
export type VirtualLineRuleFactory<TPrevEnv extends Env> = RuleFactory<SentenceChildEL[], TPrevEnv>;

export default factory;
