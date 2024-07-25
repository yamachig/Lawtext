import { RuleFactory } from "generic-parser/lib/rules/factory";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { Env } from "./env";

export const factory = new RuleFactory<SentenceChildEL[], Env>();

export default factory;
