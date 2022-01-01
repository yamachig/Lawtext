import { Rule, Empty } from "generic-parser/lib/core";
import { Env } from "./env";

export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>
