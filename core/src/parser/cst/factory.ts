import { RuleFactory } from "generic-parser/lib/rules/factory";
import type { Env } from "./env";

export const factory = new RuleFactory<string, Env>();

export default factory;
