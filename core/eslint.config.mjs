import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import react from "@eslint-react/eslint-plugin";
import tsdoc from "eslint-plugin-tsdoc";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig(
    {
        ignores: ["dist/**/*", "data/**/*", "eslint.config.mjs"],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    react.configs["recommended-typescript"],
    {
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.node,
            },
            parser: tseslint.parser,
            ecmaVersion: 12,
            sourceType: "script",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        plugins: {
            tsdoc,
            "@stylistic": stylistic,
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],

            "no-multiple-empty-lines": [
                "error", {
                    max: 2,
                },
            ],

            "comma-dangle": ["error", "always-multiline"],
            "object-curly-spacing": ["error", "always"],
            "array-element-newline": ["error", "consistent"],

            "array-bracket-newline": [
                "error", {
                    multiline: true,
                },
            ],

            "comma-spacing": [
                "error", {
                    before: false,
                    after: true,
                },
            ],

            "arrow-spacing": "error",

            "prefer-arrow-callback": "error",

            "no-constant-condition": [
                "error", {
                    checkLoops: false,
                },
            ],

            "key-spacing": [
                "error", {
                    beforeColon: false,
                },
            ],

            "space-unary-ops": [
                "error", {
                    words: true,
                    nonwords: false,
                },
            ],

            "space-infix-ops": [
                "error", {
                    int32Hint: false,
                },
            ],

            "space-before-function-paren": [
                "error", {
                    asyncArrow: "always",
                    named: "never",
                },
            ],

            "block-spacing": "error",
            "nonblock-statement-body-position": ["error", "beside"],

            "no-multi-spaces": [
                "error", {
                    ignoreEOLComments: true,
                },
            ],

            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            "keyword-spacing": "error",

            "@stylistic/quote-props": ["error", "as-needed"],

            "no-implicit-coercion": "error",

            "@typescript-eslint/no-misused-promises": [
                "error", {
                    checksVoidReturn: false,
                },
            ],

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error"],

            "@stylistic/type-annotation-spacing": "error",
            "@typescript-eslint/consistent-type-imports": [
                "error", {
                    disallowTypeAnnotations: false,
                },
            ],
            "tsdoc/syntax": "warn",

            "@eslint-react/rules-of-hooks": "error",
            "@eslint-react/exhaustive-deps": "warn",

            "@eslint-react/dom-no-unsafe-target-blank": "error",
        },
    },
    {
        files: [
            "src/parser/**/*",
            "src/analyzer/**/rules/**/*",
            "src/path/**/*",
        ],
        rules: {
            "comma-dangle": ["error", "only-multiline"],
        },
    },
);
