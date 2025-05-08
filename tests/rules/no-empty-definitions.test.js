/**
 * @fileoverview Tests for no-empty-definitions rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-empty-definitions.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/commonmark",
});

ruleTester.run("no-empty-definitions", rule, {
	valid: [
		"[foo]: bar",
		"[foo]: #bar",
		"[foo]: http://bar.com",
		"[foo]: <https://bar.com>",
	],
	invalid: [
		{
			code: "[foo]: #",
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[foo]: <>",
			errors: [
				{
					messageId: "emptyDefinition",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
	],
});
