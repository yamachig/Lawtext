import { RuleFactory } from "generic-parser/lib/rules/factory.js";
import type { SentenceChildEL } from "../../node/cst/inline.ts";
import type { Env } from "./env.ts";

export const factory = new RuleFactory<SentenceChildEL[], Env>();

export default factory;
