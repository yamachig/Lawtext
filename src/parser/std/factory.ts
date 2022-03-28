import { RuleFactory } from "generic-parser/lib/rules/factory";
import { Env } from "./env";
import { VirtualLine } from "./virtualLine";

export const factory = new RuleFactory<VirtualLine[], Env>();
export type VirtualLineRuleFactory<TPrevEnv extends Env> = RuleFactory<VirtualLine[], TPrevEnv>;

export default factory;
