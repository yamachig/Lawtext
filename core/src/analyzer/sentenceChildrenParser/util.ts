import type { Rule, Empty } from "generic-parser/lib/core/index.js";
import type { SentenceChildEL } from "../../node/cst/inline.ts";
import type { ErrorMessage } from "../../parser/cst/error.ts";
import type { Env } from "./env.ts";

export type ValueRule<TValue> = Rule<SentenceChildEL[], TValue, Env, Empty>
export type WithErrorRule<TValue> = Rule<SentenceChildEL[], { value: TValue, errors: ErrorMessage[] }, Env, Empty>
