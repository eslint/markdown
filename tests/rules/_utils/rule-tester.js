/**
 * @fileoverview A rule tester helper for running code with both `mdast-util-from-markdown` and `@eslint-markdown/parser`.
 * @author lumir(lumirlumir)
 */

// --------------------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------------------

import { parse } from "@eslint-markdown/parser";
import { RuleTester } from "eslint";
import markdown from "../../../src/index.js";

//------------------------------------------------------------------------------
// Typedefs
//------------------------------------------------------------------------------

/**
 * @import { MarkdownRuleDefinition } from "../../../src/types.ts";
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Creates a new `RuleTester` instance with the `mdast-util-from-markdown` JS parser.
 */
const ruleTesterJS = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
});

/**
 * Creates a new `RuleTester` instance with the `@eslint-markdown/parser` Rust parser.
 */
const ruleTesterRust = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
	languageOptions: {
		parser: parse,
	},
});

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Markdown rule tester.
 * @param {string} ruleName Rule name.
 * @param {MarkdownRuleDefinition} rule Rule definition.
 * @param {Parameters<RuleTester['run']>[2]} tests Test cases.
 * @returns {void}
 */
export default function ruleTester(ruleName, rule, tests) {
	describe("JS: mdast-util-from-markdown", () => {
		ruleTesterJS.run(ruleName, rule, tests);
	});

	describe("Rust: @eslint-markdown/parser", () => {
		ruleTesterRust.run(ruleName, rule, tests);
	});
}
