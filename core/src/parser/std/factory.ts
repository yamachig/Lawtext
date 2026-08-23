import { RuleFactory } from "generic-parser/lib/rules/factory.js";
import type { Env } from "./env.ts";
import type { VirtualLine } from "./virtualLine.ts";

export const factory = new RuleFactory<VirtualLine[], Env>();
export type VirtualLineRuleFactory<TPrevEnv extends Env> = RuleFactory<VirtualLine[], TPrevEnv>;

export default factory;
