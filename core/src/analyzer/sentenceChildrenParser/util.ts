import type { Rule, Empty } from "generic-parser/lib/core";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { ErrorMessage } from "../../parser/cst/error";
import type { Env } from "./env";

export type ValueRule<TValue> = Rule<SentenceChildEL[], TValue, Env, Empty>
export type WithErrorRule<TValue> = Rule<SentenceChildEL[], { value: TValue, errors: ErrorMessage[] }, Env, Empty>
