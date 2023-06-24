import { RuleFactory } from "generic-parser/lib/rules/factory";
import { Env } from "./env";

export const factory = new RuleFactory<string, Env>();

export default factory;
