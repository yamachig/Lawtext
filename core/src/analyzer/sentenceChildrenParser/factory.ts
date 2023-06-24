import { RuleFactory } from "generic-parser/lib/rules/factory";
import { SentenceChildEL } from "../../node/cst/inline";
import { Env } from "./env";

export const factory = new RuleFactory<SentenceChildEL[], Env>();
export type VirtualLineRuleFactory<TPrevEnv extends Env> = RuleFactory<SentenceChildEL[], TPrevEnv>;

export default factory;
