import { Rule, Empty } from "generic-parser/lib/core";
import { SentenceChildEL } from "../../node/cst/inline";
import { ErrorMessage } from "../../parser/cst/error";
import { Env } from "./env";

export type ValueRule<TValue> = Rule<SentenceChildEL[], TValue, Env, Empty>
export type WithErrorRule<TValue> = Rule<SentenceChildEL[], { value: TValue, errors: ErrorMessage[] }, Env, Empty>
