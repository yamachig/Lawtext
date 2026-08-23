import { RuleFactory } from "generic-parser/lib/rules/factory.js";
import type { Env } from "./env.ts";

export const factory = new RuleFactory<string, Env>();

export default factory;
