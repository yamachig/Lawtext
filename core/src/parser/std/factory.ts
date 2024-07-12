import { RuleFactory } from "generic-parser/lib/rules/factory";
import type { Env } from "./env";
import type { VirtualLine } from "./virtualLine";

export const factory = new RuleFactory<VirtualLine[], Env>();
export type VirtualLineRuleFactory<TPrevEnv extends Env> = RuleFactory<VirtualLine[], TPrevEnv>;

export default factory;
